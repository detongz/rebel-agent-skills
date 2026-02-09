#!/usr/bin/env python3
"""
MySkills Demo - 真实自动化录制
使用 Selenium + Safari WebDriver (macOS 原生支持)
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.safari.service import Service
import time
import subprocess
import os

print("🎬 MySkills 真实自动化录制")
print("=======================")
print()

# 创建视频目录
os.makedirs("demo/videos", exist_ok=True)

print("📍 启动 Safari WebDriver...")

# 启动 Safari - macOS 不需要额外的 driver
options = webdriver.SafariOptions()
options.webdriver_accept_untrusted_certs = True
options.automatic_inspection = False

driver = webdriver.Safari(options=options)

try:
    # Scene 1: 打开 MySkills 网站
    print("📍 Scene 1: 打开 MySkills 网站...")
    driver.get("https://myskills2026.ddttupupo.buzz")
    time.sleep(5)
    print("  ✓ 网站已加载")

    # Scene 2: 滚动显示技能卡片
    print("📍 Scene 2: 滚动显示技能卡片...")

    # 使用 JavaScript 滚动
    driver.execute_script("window.scrollBy({top: 400, behavior: 'smooth'});")
    time.sleep(3)

    driver.execute_script("window.scrollBy({top: 400, behavior: 'smooth'});")
    time.sleep(3)

    driver.execute_script("window.scrollBy({top: 400, behavior: 'smooth'});")
    time.sleep(3)

    print("  ✓ 技能卡片已显示")

    # Scene 3: 回到顶部
    print("📍 Scene 3: 回到顶部...")
    driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
    time.sleep(3)
    print("  ✓ 回到顶部")

    # Scene 4: 尝试找到 Smart Matching
    print("📍 Scene 4: 查找 Smart Matching...")
    try:
        smart_match = driver.find_element(By.XPATH, "//button[contains(text(), 'Smart') or contains(text(), 'Match')]")
        smart_match.click()
        time.sleep(3)
        print("  ✓ Smart Matching 已打开")
    except:
        print("  ⚠️  Smart Matching 未找到，展示主页")

    time.sleep(5)

    # Scene 5: 显示钱包连接
    print("📍 Scene 5: 显示钱包连接区域...")
    try:
        connect_btn = driver.find_element(By.XPATH, "//button[contains(@class, 'connect') or contains(text(), 'Wallet') or contains(text(), 'Connect')]")
        # 高亮显示按钮区域
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", connect_btn)
        time.sleep(2)
        print("  ✓ 钱包连接区域已显示")
    except:
        print("  ⚠️  钱包按钮未找到")

    time.sleep(5)

    # Scene 6: Final CTA
    print("📍 Scene 6: Final CTA...")
    driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
    time.sleep(5)
    print("  ✓ Final CTA 已显示")

    # 保持浏览器打开以便查看
    print("")
    print("✅ 演示完成！")
    print("📌 浏览器保持打开状态，可以手动查看效果")
    print("")
    print("💡 要录制视频，请按 Cmd+Shift+5 开始录屏")
    print("")

    # 等待用户手动关闭
    input("按 Enter 关闭浏览器...")

finally:
    driver.quit()
    print("👋 浏览器已关闭")

print("")
print("💡 提示：演示完成后，使用 ffmpeg 转换录制的屏幕为 MP4")
