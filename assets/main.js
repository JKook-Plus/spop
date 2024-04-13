async function splitAndDownload() {
	const fileInput = document.getElementById("pdfFile");
	const file = fileInput.files[0];
	if (!file) {
		alert("Please select a PDF file.");
		return;
	}

	const filename = file.name.replace(/\.[^/.]+$/, "");

	const pageCountInput = document.getElementById("pageCountInput");
	const pageCount = parseInt(pageCountInput.value);
	if (pageCount <= 0) {
		alert("Please enter a valid number of pages per document.");
		return;
	}

	const reader = new FileReader();
	reader.onload = async function (event) {
		const pdfData = new Uint8Array(event.target.result);
		const pdfDoc = await PDFLib.PDFDocument.load(pdfData);
		const totalPageCount = pdfDoc.getPageCount();

		const zip = new JSZip();
		for (let i = 0; i < totalPageCount; i += pageCount) {
			const doc = await PDFLib.PDFDocument.create();
			const endIndex = Math.min(i + pageCount, totalPageCount);
			const copiedPages = await doc.copyPages(
				pdfDoc,
				Array.from({ length: endIndex - i }, (_, index) => i + index)
			);
			copiedPages.forEach((page) => doc.addPage(page));
			const docData = await doc.save();
			zip.file(`${filename} (${i + 1}-${endIndex}).pdf`, docData);
		}

		// Generate and download the zip file
		zip.generateAsync({ type: "blob" }).then(function (blob) {
			const zipName = `${filename} (split every ${pageCount} pages).zip`;
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = zipName;
			link.click();
		});
	};

	reader.readAsArrayBuffer(file);
}
