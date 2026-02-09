#!/usr/bin/env python3
"""
Simple Selenium Safari Test - 测试 Safari WebDriver 是否可用
"""

from selenium import webdriver
from selenium.webdriver.safari.options import Options
import time

print("🧪 测试 Safari WebDriver...")

try:
    options = Options()
    options.webdriver_accept_untrusted_certs = True

    driver = webdriver.Safari(options=options)
    print("✅ Safari WebDriver 启动成功!")

    # 测试简单的页面加载
    driver.get("https://www.apple.com")
    print("✅ 页面加载成功!")

    time.sleep(3)

    driver.quit()
    print("✅ Safari WebDriver 工作正常!")

except Exception as e:
    print(f"❌ 错误: {e}")
    print("")
    print("💡 解决方案:")
    print("1. 打开 Safari")
    print("2. 菜单栏 → Safari → 偏好设置 → 高级")
    print("3. 勾选 '显示开发菜单'")
    print("4. 关闭 Safari")
    print("5. 重新运行此脚本")
