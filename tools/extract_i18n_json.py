#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract i18n data from assets/i18n.js to JSON files
Manual parsing approach
"""

import json
import os
import re

def extract_i18n(js_file):
    """Extract I18N object manually"""
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the I18N object - extract just the object definition part
    # Stop before the functions start
    i18n_start = content.find('const I18N = {')
    if i18n_start == -1:
        raise ValueError("Could not find I18N object")
    
    # Find where the I18N object ends (before functions)
    # Look for the closing brace after all language objects
    i18n_part = content[i18n_start:]
    
    # Find the matching closing brace for I18N
    brace_count = 0
    i18n_end = 0
    in_string = False
    string_char = None
    
    for i, char in enumerate(i18n_part):
        if char in ('"', "'") and (i == 0 or i18n_part[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None
        elif not in_string:
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    i18n_end = i + 1
                    break
    
    i18n_object_str = i18n_part[:i18n_end]
    
    # Now extract each language
    langs = {}
    for lang in ['en', 'zh', 'jp']:
        # Find lang: { ... }
        lang_pattern = rf"{lang}:\s*\{{"
        match = re.search(lang_pattern, i18n_object_str)
        
        if match:
            start_pos = match.end()
            # Find matching closing brace
            brace_count = 1
            in_string = False
            string_char = None
            end_pos = start_pos
            
            for i in range(start_pos, len(i18n_object_str)):
                char = i18n_object_str[i]
                
                if char in ('"', "'") and (i == 0 or i18n_object_str[i-1] != '\\'):
                    if not in_string:
                        in_string = True
                        string_char = char
                    elif char == string_char:
                        in_string = False
                        string_char = None
                elif not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_pos = i
                            break
            
            lang_block = i18n_object_str[start_pos:end_pos]
            lang_dict = {}
            
            # Extract key-value pairs - handle single quotes with escaped content
            # Pattern: 'key': 'value',
            # Handle multiline and escaped quotes
            kv_pattern = r"'([^']+)':\s*'((?:[^'\\]|\\.|\\n)*?)'"
            
            for match in re.finditer(kv_pattern, lang_block, re.DOTALL):
                key = match.group(1)
                value = match.group(2)
                # Unescape
                value = value.replace("\\'", "'")
                value = value.replace('\\"', '"')
                value = value.replace('\\n', '\n')
                value = value.replace('\\t', '\t')
                value = value.replace('\\\\', '\\')
                lang_dict[key] = value
            
            langs[lang] = lang_dict
    
    return langs

def main():
    js_file = 'assets/i18n.js'
    output_dir = 'i18n'
    
    if not os.path.exists(js_file):
        print(f"Error: {js_file} not found")
        return
    
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Extracting i18n data from {js_file}...")
    langs = extract_i18n(js_file)
    
    for lang, data in langs.items():
        output_file = os.path.join(output_dir, f'{lang}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ Extracted {len(data)} keys to {output_file}")
    
    print(f"\nTotal languages: {len(langs)}")
    total_keys = set()
    for data in langs.values():
        total_keys.update(data.keys())
    print(f"Total unique keys: {len(total_keys)}")

if __name__ == '__main__':
    main()
