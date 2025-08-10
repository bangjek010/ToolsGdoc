// Fungsi onOpen dan showSidebar tidak berubah

function onOpen() {
  DocumentApp.getUi()
      .createMenu('Konverter Kustom')
      .addItem('Buka Konverter', 'showSidebar')
      .addToUi();
}

function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Konverter Heading');
  DocumentApp.getUi().showSidebar(html);
}

// ====================================================================
// FUNGSI-FUNGSI DI BAWAH INI TELAH DIPERBAIKI
// ====================================================================

/**
 * Memproses teks yang diseleksi untuk mengubah # menjadi H1, H2, H3.
 * Versi ini sudah diperbaiki untuk menangani seleksi teks parsial.
 */
function processSelectedText() {
  var selection = DocumentApp.getActiveDocument().getSelection();
  
  if (!selection) {
    DocumentApp.getUi().alert('Silakan pilih (blok) teks yang ingin diubah terlebih dahulu.');
    return;
  }
  
  var elements = selection.getRangeElements();
  var processedParagraphs = {}; // Objek untuk melacak paragraf yang sudah diproses

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i].getElement();
    var paragraph = null;

    // --- PERBAIKAN UTAMA ADA DI SINI ---
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      // Jika elemen adalah TEKS, dapatkan induknya yaitu PARAGRAF
      paragraph = element.getParent().asParagraph();
    } else if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
      // Jika sudah PARAGRAF, langsung gunakan
      paragraph = element.asParagraph();
    } else {
      // Lewati elemen lain yang tidak bisa di-edit sebagai teks (misal: gambar)
      continue;
    }

    // Cek agar tidak memproses paragraf yang sama berulang kali
    var paragraphIndex = DocumentApp.getActiveDocument().getBody().getChildIndex(paragraph);
    if (processedParagraphs[paragraphIndex]) {
      continue;
    }
    processedParagraphs[paragraphIndex] = true;
    
    // Logika konversi tetap sama
    var text = paragraph.getText();
    if (text.includes('####')) {
      paragraph.replaceText('####', 'H4');
    } else if (text.includes('###')) {
      paragraph.replaceText('###', 'H3');
    } else if (text.includes('##')) {
      paragraph.replaceText('##', 'H2');
    } else if (text.includes('#')) {
      paragraph.replaceText('#', 'H1');
    } else if (text.includes('---')) {
      paragraph.replaceText('---', '');
    }else if (text.includes('--')) {
      paragraph.replaceText('--', '');
    }
  }
  DocumentApp.getUi().alert('Konversi heading selesai!');
}


/**
 * Memproses teks yang diseleksi untuk mengubah baris yang diawali '*' menjadi bulleted list.
 * Versi ini sudah diperbaiki untuk menangani seleksi teks parsial.
 */
function processListItems() {
  var selection = DocumentApp.getActiveDocument().getSelection();

  if (!selection) {
    DocumentApp.getUi().alert('Silakan pilih (blok) teks yang ingin diubah terlebih dahulu.');
    return;
  }

  var elements = selection.getRangeElements();
  var processedParagraphs = {};

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i].getElement();
    var paragraph = null;

    // Logika untuk mendapatkan paragraf yang benar (sudah baik)
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      paragraph = element.getParent().asParagraph();
    } else if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
      paragraph = element.asParagraph();
    } else {
      continue;
    }

    // Cek agar tidak memproses paragraf yang sama berulang kali
    var paragraphIndex = DocumentApp.getActiveDocument().getBody().getChildIndex(paragraph);
    if (processedParagraphs[paragraphIndex]) {
      continue;
    }
    
    var text = paragraph.getText();
    
    // Cek jika baris diawali dengan '*'
    if (text.trim().startsWith('*')) {
      // Tandai paragraf ini sudah akan diproses
      processedParagraphs[paragraphIndex] = true;

      // --- PERBAIKAN UTAMA: LOGIKA BARU YANG LEBIH ANDAL ---
      
      // 1. Ambil teks asli dan bersihkan penanda '*' di depannya
      var newText = text.replace(/^\s*\*\s*/, '');

      // 2. Dapatkan 'induk' (parent) dan posisi (index) dari paragraf
      var parent = paragraph.getParent();
      var index = parent.getChildIndex(paragraph);

      // 3. Hapus paragraf lama dari dokumen
      paragraph.removeFromParent();

      // 4. Sisipkan elemen 'list item' baru di posisi yang sama dengan teks yang sudah bersih
      var listItem = parent.insertListItem(index, newText);
      
      // 5. Atur jenis 'bullet' pada list item baru tersebut (ini pasti berhasil)
      listItem.setGlyphType(DocumentApp.GlyphType.BULLET);
    }
  }
  DocumentApp.getUi().alert('Konversi list selesai!');
}
