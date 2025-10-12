import { ROBOTO_FONT_BASE64 } from './RobotoFontBase64';

// Khai báo biến toàn cục từ CDN để TypeScript nhận diện
declare var jspdf: any;
declare var html2canvas: any;

/**
 * Tạo và tải về một file PDF từ một phần tử HTML.
 * @param invoiceElement Phần tử HTML chứa giao diện hóa đơn.
 * @param orderId ID của đơn hàng, dùng để đặt tên file.
 * @returns {Promise<void>}
 */
export const generateInvoicePdf = async (invoiceElement: HTMLElement, orderId: string): Promise<void> => {
    // Truy cập lớp jsPDF từ đối tượng window
    const { jsPDF } = jspdf;

    // Tạo một đối tượng PDF mới
    // 'p' = portrait (dọc), 'mm' = millimeters, 'a4' = khổ giấy A4
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Thêm font Roboto hỗ trợ tiếng Việt vào PDF
    // 'Roboto-Regular.ttf' là tên ảo của font trong VFS (Virtual File System)
    // ROBOTO_FONT_BASE64 là chuỗi base64 của file .ttf
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_FONT_BASE64);
    // Thêm font vào danh sách font có thể sử dụng
    // 'Roboto' là tên bạn sẽ dùng để gọi font này
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    // Đặt font mặc định cho toàn bộ tài liệu
    doc.setFont('Roboto');

    try {
        // Sử dụng html2canvas để "chụp ảnh" phần tử HTML
        const canvas = await html2canvas(invoiceElement, {
            scale: 2, // Tăng độ phân giải của ảnh chụp
            useCORS: true,
        });

        // Chuyển canvas thành ảnh dạng PNG base64
        const imgData = canvas.toDataURL('image/png');
        
        // Lấy kích thước của khổ giấy A4
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        // Tính toán tỷ lệ của ảnh để vừa với chiều rộng của PDF
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const finalImgWidth = pdfWidth;
        const finalImgHeight = finalImgWidth / ratio;
        
        let position = 0;
        let heightLeft = finalImgHeight;

        // Thêm trang đầu tiên
        doc.addImage(imgData, 'PNG', 0, position, finalImgWidth, finalImgHeight);
        heightLeft -= pdfHeight;

        // Nếu hóa đơn dài hơn một trang, thêm các trang mới
        while (heightLeft > 0) {
            position = heightLeft - finalImgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, finalImgWidth, finalImgHeight);
            heightLeft -= pdfHeight;
        }

        // Lưu file PDF với tên được định dạng
        doc.save(`hoadon-${orderId}.pdf`);

    } catch (error) {
        console.error("Lỗi trong quá trình tạo PDF:", error);
        throw new Error("Không thể tạo hóa đơn PDF.");
    }
};