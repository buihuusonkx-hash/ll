import React, { useState } from 'react';
import { Upload, Select, Button, ConfigProvider, message, Card, Spin, Typography, Divider, Checkbox } from 'antd';
import { InboxOutlined, SettingOutlined, FileTextOutlined, SendOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const { Option } = Select;
const { Title, Text } = Typography;

const App = () => {
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 1');
  const [isDigitalComp, setIsDigitalComp] = useState(true);
  const [isAI, setIsAI] = useState(false);
  const [lessonFile, setLessonFile] = useState<any>(null);
  const [ppctFile, setPpctFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!lessonFile) {
      message.error('Vui lòng tải lên file giáo án!');
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const lessonBase64 = await fileToBase64(lessonFile.originFileObj);
      let ppctBase64 = null;
      if (ppctFile) {
        ppctBase64 = await fileToBase64(ppctFile.originFileObj);
      }

      const prompt = `Bạn là một chuyên gia giáo dục về năng lực số. 
      Dựa trên tài liệu giáo án và PPCT (nếu có) được cung cấp, hãy soạn một kế hoạch bài dạy (giáo án) tập trung vào việc phát triển năng lực số cho học sinh.
      
      Thông tin:
      - Môn học: ${subject}
      - Khối lớp: ${grade}
      - Tích hợp Năng lực số: ${isDigitalComp ? 'Có' : 'Không'}
      - Tích hợp AI: ${isAI ? 'Có' : 'Không'}
      
      Yêu cầu:
      1. Phân tích các năng lực số cần đạt trong bài học này (theo khung năng lực số Việt Nam).
      2. Thiết kế các hoạt động học tập có ứng dụng công nghệ thông tin sáng tạo${isAI ? ', đặc biệt là ứng dụng Trí tuệ nhân tạo (AI)' : ''}.
      3. Đề xuất các công cụ số phù hợp (ví dụ: Canva, Kahoot, Padlet, Google Workspace...${isAI ? ', ChatGPT, Gemini, Canva AI, các công cụ tạo ảnh AI' : ''}).
      4. Cấu trúc giáo án theo quy định hiện hành (Công văn 5512).
      
      Hãy trình bày bằng tiếng Việt, định dạng Markdown rõ ràng, chuyên nghiệp.`;

      const parts: any[] = [
        { text: prompt },
        { inlineData: { data: lessonBase64, mimeType: lessonFile.type || 'application/pdf' } }
      ];

      if (ppctBase64) {
        parts.push({ inlineData: { data: ppctBase64, mimeType: ppctFile.type || 'application/pdf' } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
      });

      setResult(response.text || "Không có kết quả trả về.");
      message.success('Đã soạn giáo án thành công!');
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi gọi Gemini API. Vui lòng kiểm tra file và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1d4ed8',
          borderRadius: 12,
        },
      }}
    >
      <div className="min-h-screen bg-blue-50 p-4 md:p-10 font-sans">
        {/* Header */}
        <div className="max-w-6xl mx-auto bg-blue-600 text-white p-8 rounded-t-3xl flex flex-col md:flex-row justify-between items-center shadow-2xl gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black uppercase tracking-widest m-0">Soạn giáo án năng lực số</h1>
            <p className="text-blue-100 text-base mt-2 opacity-90">Trợ lý ảo hỗ trợ giáo viên thời đại số 4.0</p>
          </div>
          <div className="flex gap-6 items-center">
            <Button 
              icon={<SettingOutlined />} 
              ghost 
              className="hover:bg-blue-500 border-blue-300 h-10 px-6 rounded-full"
              onClick={() => message.info('Hệ thống đã được cấu hình sẵn.')}
            >
              Cấu hình
            </Button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Powered by</span>
              <span className="text-xl font-serif italic font-black text-blue-200">Gemini AI</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Form Thông tin */}
            <Card 
              className="shadow-xl border-blue-100 rounded-3xl overflow-hidden"
              title={<span className="text-blue-700 font-black text-lg flex items-center gap-3"><FileTextOutlined /> THÔNG TIN BÀI DẠY</span>}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-tighter">Môn học</label>
                  <Select 
                    className="w-full h-12" 
                    value={subject} 
                    onChange={setSubject}
                    size="large"
                  >
                    <Option value="Toán học">Toán học</Option>
                    <Option value="Ngữ văn">Ngữ văn</Option>
                    <Option value="Tiếng Anh">Tiếng Anh</Option>
                    <Option value="Vật lý">Vật lý</Option>
                    <Option value="Hóa học">Hóa học</Option>
                    <Option value="Sinh học">Sinh học</Option>
                    <Option value="Lịch sử">Lịch sử</Option>
                    <Option value="Địa lý">Địa lý</Option>
                    <Option value="Tin học">Tin học</Option>
                    <Option value="GDCD">GDCD</Option>
                    <Option value="GDTC">Giáo dục thể chất (GDTC)</Option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-tighter">Khối lớp</label>
                  <Select 
                    className="w-full h-12" 
                    value={grade} 
                    onChange={setGrade}
                    size="large"
                  >
                    {[...Array(12)].map((_, i) => (
                      <Option key={i} value={`Lớp ${i + 1}`}>{`Lớp ${i + 1}`}</Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Checkbox 
                    checked={isDigitalComp} 
                    onChange={(e) => setIsDigitalComp(e.target.checked)}
                    className="font-semibold text-blue-800"
                  >
                    Tích hợp năng lực số (Khai thác, truyền thông, an toàn số)
                  </Checkbox>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <Checkbox 
                    checked={isAI} 
                    onChange={(e) => setIsAI(e.target.checked)}
                    className="font-semibold text-purple-800"
                  >
                    Tích hợp AI & Công nghệ mới (Generative AI, Lập trình)
                  </Checkbox>
                </div>
              </div>
            </Card>

            {/* Upload Section */}
            <Card 
              className="shadow-xl border-blue-100 rounded-3xl overflow-hidden"
              title={<span className="text-blue-700 font-black text-lg flex items-center gap-3"><InboxOutlined /> TÀI LIỆU ĐẦU VÀO</span>}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Text strong className="text-[10px] uppercase text-gray-400 tracking-widest">Giáo án gốc (Bắt buộc)</Text>
                  <Upload.Dragger 
                    className="bg-blue-50/30 border-dashed border-blue-200 hover:border-blue-500 transition-all rounded-2xl"
                    multiple={false}
                    beforeUpload={(file) => {
                      setLessonFile({ originFileObj: file, type: file.type });
                      return false;
                    }}
                    onRemove={() => setLessonFile(null)}
                    maxCount={1}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined className="text-blue-500 text-5xl" /></p>
                    <p className="font-black text-blue-900 text-base">Tải lên Giáo án</p>
                    <p className="text-xs text-gray-500 mt-2">Hỗ trợ .docx, .pdf, .txt</p>
                  </Upload.Dragger>
                </div>
                <div className="space-y-3">
                  <Text strong className="text-[10px] uppercase text-gray-400 tracking-widest">PPCT (Tùy chọn)</Text>
                  <Upload.Dragger 
                    className="bg-purple-50/30 border-dashed border-purple-200 hover:border-purple-500 transition-all rounded-2xl"
                    multiple={false}
                    beforeUpload={(file) => {
                      setPpctFile({ originFileObj: file, type: file.type });
                      return false;
                    }}
                    onRemove={() => setPpctFile(null)}
                    maxCount={1}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined className="text-purple-500 text-5xl" /></p>
                    <p className="font-black text-purple-900 text-base">Tải lên PPCT</p>
                    <p className="text-xs text-gray-500 mt-2">Giúp AI bám sát chương trình</p>
                  </Upload.Dragger>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <div className="flex flex-col items-center gap-6 py-6">
              <Button 
                type="primary" 
                size="large" 
                className="h-16 px-20 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 bg-gradient-to-r from-blue-700 to-blue-500 border-none"
                onClick={handleGenerate}
                loading={loading}
                icon={!loading && <SendOutlined />}
              >
                {loading ? 'ĐANG PHÂN TÍCH & SOẠN THẢO...' : '✨ BẮT ĐẦU SOẠN GIÁO ÁN'}
              </Button>
              <Text className="text-gray-400 italic text-sm text-center max-w-md">AI sẽ tự động phân tích và lồng ghép các năng lực số phù hợp nhất vào bài giảng của bạn</Text>
            </div>

            {/* Result Section */}
            {result && (
              <Card 
                className="shadow-2xl border-green-100 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700"
                title={<span className="text-green-700 font-black text-lg flex items-center gap-3"><CheckCircleOutlined /> KẾT QUẢ GIÁO ÁN</span>}
                extra={<Button danger ghost onClick={() => setResult(null)} className="rounded-full">Xóa kết quả</Button>}
              >
                <div className="prose prose-blue max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-inner overflow-auto max-h-[800px]">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <Divider className="my-8" />
                <div className="flex justify-center gap-6">
                  <Button 
                    type="primary"
                    size="large"
                    icon={<DownloadOutlined />} 
                    className="h-12 px-10 rounded-full font-bold"
                    onClick={() => {
                      const blob = new Blob([result], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Giao_an_nang_luc_so_${subject}_${grade}.md`;
                      a.click();
                    }}
                  >
                    Tải xuống (.md)
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="bg-blue-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
              
              <h3 className="text-2xl font-black mb-8 border-b border-blue-800 pb-4 flex items-center gap-3">
                <span className="bg-blue-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg">?</span>
                HƯỚNG DẪN
              </h3>
              <ul className="space-y-8">
                <li className="flex gap-5">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm font-black shadow-lg">1</span>
                  <p className="text-sm leading-relaxed opacity-90 font-medium">Chọn <b>Môn học</b> và <b>Khối lớp</b> tương ứng với bài dạy.</p>
                </li>
                <li className="flex gap-5">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm font-black shadow-lg">2</span>
                  <p className="text-sm leading-relaxed opacity-90 font-medium">Tải lên file <b>Giáo án gốc</b> (PDF/Docx) để AI hiểu nội dung cốt lõi.</p>
                </li>
                <li className="flex gap-5">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm font-black shadow-lg">3</span>
                  <p className="text-sm leading-relaxed opacity-90 font-medium">Nhấn nút <b>Bắt đầu</b> và AI sẽ thiết kế các hoạt động năng lực số sáng tạo.</p>
                </li>
              </ul>
              <div className="mt-10 pt-8 border-t border-blue-800">
                <p className="text-xs text-blue-300 italic leading-loose">Lưu ý: Kết quả từ AI mang tính tham khảo chuyên môn, thầy cô nên điều chỉnh để phù hợp với đặc thù học sinh và cơ sở vật chất của trường.</p>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-xl rounded-[2.5rem] p-4">
              <Title level={4} className="text-blue-900 font-black mb-6">ƯU ĐIỂM VƯỢT TRỘI</Title>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircleOutlined className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <Text strong className="block text-blue-900">Chuẩn khung năng lực</Text>
                    <Text className="text-xs text-gray-500">Bám sát khung năng lực số 446/QĐ-BGDĐT.</Text>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckCircleOutlined className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <Text strong className="block text-blue-900">Công cụ số hiện đại</Text>
                    <Text className="text-xs text-gray-500">Gợi ý Kahoot, Canva, Padlet, AI Tools...</Text>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <CheckCircleOutlined className="text-purple-600 text-lg" />
                  </div>
                  <div>
                    <Text strong className="block text-blue-900">Tiết kiệm thời gian</Text>
                    <Text className="text-xs text-gray-500">Hoàn thành giáo án điện tử trong 30 giây.</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-gray-400 text-sm pb-10 border-t border-gray-200 pt-10">
          <p className="font-bold">© 2026 DIGITAL COMPETENCY ASSISTANT</p>
          <p className="mt-2">Xây dựng bởi Google AI Studio • Trí tuệ nhân tạo vì giáo dục</p>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default App;
