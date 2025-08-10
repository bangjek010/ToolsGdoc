# app.py

import re
import gradio as gr

# ==============================================================================
# FUNGSI ANDA (TIDAK ADA PERUBAHAN DI SINI)
# ==============================================================================
def rapikan_artikel_pro(teks_mentah: str) -> str:
    """
    Merapikan artikel, dengan tetap memproses paragraf pertama setelah metadata
    untuk konversi heading (misal: # menjadi H1).
    """
    if not teks_mentah:
        return "Input kosong. Silakan masukkan teks."
    
    blok_kepala = []
    blok_isi = []
    penanda_akhir_kepala = "alt text gambar:"
    
    semua_baris = teks_mentah.strip().split('\n')

    indeks_terakhir_meta = -1
    for i in range(len(semua_baris)):
        if penanda_akhir_kepala in semua_baris[i].lower():
            indeks_terakhir_meta = i
            break
            
    if indeks_terakhir_meta != -1:
        blok_kepala = semua_baris[:indeks_terakhir_meta + 1]
        blok_isi = semua_baris[indeks_terakhir_meta + 1:]
    else:
        blok_isi = semua_baris

    teks_untuk_diproses = '\n'.join(blok_isi)
    
    baris_tahap_2 = []
    MAKS_KATA_UNTUK_LIST = 15
    sedang_di_bawah_sub_judul = False
    formatting_stopped = False

    for baris in teks_untuk_diproses.strip().split('\n'):
        baris = baris.strip()
        if formatting_stopped or "faq" in baris.lower():
            formatting_stopped = True
            if baris_tahap_2 and baris_tahap_2[-1]: baris_tahap_2.append('')
            baris_tahap_2.append(baris)
            continue
        if not baris: continue

        is_main_heading = baris.startswith(('# ', '## '))
        is_sub_heading = baris.startswith(('### ', '#### '))
        is_list_item = baris.startswith('* ')
        is_short_line = len(baris.split()) < MAKS_KATA_UNTUK_LIST

        if is_main_heading or is_sub_heading:
            if baris_tahap_2 and baris_tahap_2[-1]: baris_tahap_2.append('')
            baris_tahap_2.append(baris)
            sedang_di_bawah_sub_judul = is_sub_heading
        elif sedang_di_bawah_sub_judul and is_short_line and not is_list_item:
            baris_tahap_2.append(f"* {baris}")
        else:
            sedang_di_bawah_sub_judul = False
            if baris_tahap_2 and baris_tahap_2[-1] and (baris_tahap_2[-1].startswith(('* ', '### '))):
                if not is_list_item:
                    baris_tahap_2.append('')
            baris_tahap_2.append(baris)
    
    teks_setelah_tahap_2 = '\n'.join(baris_tahap_2)
    teks_dirapikan = teks_setelah_tahap_2.replace('####', 'H4').replace('###', 'H3').replace('##', 'H2').replace('#', 'H1').replace('---', '').replace('--', '')

    bagian_kepala = "\n".join(blok_kepala)
    bagian_isi_rapi = teks_dirapikan.strip()

    if bagian_kepala and bagian_isi_rapi:
        return f"{bagian_kepala}\n\n{bagian_isi_rapi}"
    else:
        return bagian_kepala or bagian_isi_rapi

# ==============================================================================
# ANTARMUKA APLIKASI (UI) MENGGUNAKAN GRADIO
# ==============================================================================
js_copy_function = """
(text_to_copy) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text_to_copy).then(() => {
            alert("Teks berhasil disalin ke clipboard!");
        }).catch(err => {
            alert("Gagal menyalin teks.");
        });
    }
    return text_to_copy;
}
"""

with gr.Blocks(theme=gr.themes.Soft()) as app: # GANTI NAMA DARI 'antarmuka' MENJADI 'app'
    gr.Markdown("# Alat Perapi Artikel (Versi Final)")
    gr.Markdown("Versi ini tidak akan mengubah bagian awal artikel (hingga 'Alt Text Gambar') dan hanya merapikan sisanya, termasuk judul utama.")
    
    with gr.Row():
        teks_input = gr.Textbox(lines=25, label="Teks Berantakan", placeholder="Tempelkan (paste) seluruh artikel Anda di sini...")
        teks_output = gr.Textbox(lines=25, label="Hasil Rapi", interactive=False)
    
    with gr.Row():
        tombol_submit = gr.Button("Submit", variant="primary")
        tombol_copy = gr.Button("Salin Hasil")
        tombol_clear = gr.Button("Clear", variant="stop")

    tombol_submit.click(fn=rapikan_artikel_pro, inputs=teks_input, outputs=teks_output)
    tombol_copy.click(fn=lambda x: x, inputs=teks_output, outputs=None, js=js_copy_function)
    tombol_clear.click(fn=lambda: ("", ""), inputs=None, outputs=[teks_input, teks_output])

# TIDAK ADA LAGI baris 'app.launch()' di sini
