import xml.etree.ElementTree as ET
import json
import re
import os

def parse_time_to_seconds(time_str):
    """
    將時間字串（例如 "9.408" 或 "1:00.628"）轉換為浮點數秒數。
    """
    if not time_str:
        return 0.0
    if ':' in time_str:
        # 格式 M:SS.mmm
        parts = time_str.split(':')
        minutes = int(parts[0])
        seconds = float(parts[1])
        return minutes * 60 + seconds
    else:
        # 格式 S.mmm
        return float(time_str)

def format_seconds_to_mmss_mm(seconds_float):
    """
    將浮點數秒數轉換為 JSON 需要的 MM:SS.mm 格式字串。
    """
    total_milliseconds = int(round(seconds_float * 1000))
    minutes = total_milliseconds // 60000
    seconds = (total_milliseconds % 60000) / 1000
    return f"{minutes:02d}:{seconds:05.2f}"

def calculate_duration_centiseconds(start_float, end_float):
    """
    計算時長，單位為 1/100 秒 (centiseconds)，保留一位小數。
    """
    duration_s = end_float - start_float
    duration_cs = duration_s * 100
    return round(duration_cs, 1)

def convert_xml_file_to_json(input_filename, output_filename):
    if not os.path.exists(input_filename):
        print(f"錯誤: 找不到輸入檔案 '{input_filename}'")
        return

    # 1. 讀取檔案
    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            xml_content = f.read()
    except Exception as e:
        print(f"讀取檔案時發生錯誤: {e}")
        return

    # 2. XML 清理與預處理 (針對您的新 XML 格式進行了正則優化)
    
    # A. 移除 xmlns 定義 (例如 xmlns="...", xmlns:itunes="...")
    # 匹配模式：空格 + xmlns + 可選的(:xxx) + ="..."
    xml_content = re.sub(r'\sxmlns(:[^=]+)?="[^"]*?"', '', xml_content)

    # B. 移除帶有冒號的屬性 (例如 itunes:key="...", ttm:agent="...", xml:lang="...")
    # 匹配模式：空格 + 字母數字 + 冒號 + 字母數字 + ="..."
    xml_content = re.sub(r'\s\w+:\w+="[^"]*?"', '', xml_content)

    # C. 移除標籤名稱中的冒號前綴 (例如 <ttm:agent> 變成 <agent>, </ttm:agent> 變成 </agent>)
    # 這是為了防止因為移除了 xmlns 定義，導致解析器遇到 ttm:agent 時報錯 "unbound prefix"
    xml_content = re.sub(r'(</?)\w+:', r'\1', xml_content)

    # 包裹 root 以防萬一 (雖然您的輸入有 <tt> root，但加一層保險不影響解析)
    wrapped_content = f"<root>{xml_content}</root>"

    try:
        root = ET.fromstring(wrapped_content)
    except ET.ParseError as e:
        # 如果失敗，嘗試解析未包裹的內容
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError as e2:
            print(f"XML 解析失敗。包裹後錯誤: {e}\n原始錯誤: {e2}")
            return

    output_json = []

    # 3. 提取資料
    # 尋找所有 p 標籤
    for p_tag in root.findall('.//p'):
        begin_time_str = p_tag.get('begin')
        
        # 如果 p 標籤沒有 begin，試著忽略它 (這份 XML 每個 p 都有 begin)
        if not begin_time_str:
            continue
            
        start_seconds = parse_time_to_seconds(begin_time_str)
        
        text_array = []
        
        # 遍歷 span
        for span_tag in p_tag.findall('span'):
            phrase = span_tag.text if span_tag.text is not None else ""
            
            span_begin_str = span_tag.get('begin')
            span_end_str = span_tag.get('end')
            
            if span_begin_str and span_end_str:
                span_start_seconds = parse_time_to_seconds(span_begin_str)
                span_end_seconds = parse_time_to_seconds(span_end_str)
                
                duration_val = calculate_duration_centiseconds(span_start_seconds, span_end_seconds)
                
                text_array.append({
                    "phrase": phrase,
                    "duration": duration_val
                })

        if text_array:
            entry = {
                "time": format_seconds_to_mmss_mm(start_seconds),
                "text": text_array,
                "translation": ""
            }
            output_json.append(entry)

    # 4. 寫入輸出
    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(output_json, f, ensure_ascii=False, indent=4)
        print(f"轉換完成！已將結果寫入 '{output_filename}'")
    except Exception as e:
        print(f"寫入 JSON 檔案時發生錯誤: {e}")

# --- 主程式執行區 ---
if __name__ == "__main__":
    INPUT_FILE = os.path.join(os.path.dirname(__file__), 'py_output', '001_xml_to_json', 'input.xml')
    OUTPUT_FILE = os.path.join(os.path.dirname(__file__), 'py_output', '001_xml_to_json', 'output.json')
    
    convert_xml_file_to_json(INPUT_FILE, OUTPUT_FILE)