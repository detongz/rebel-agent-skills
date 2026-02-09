#!/usr/bin/env python3
from selenium import webdriver
from selenium.webdriver.safari.options import Options
import time

print("Testing Safari WebDriver...")
try:
    options = Options()
    options.webdriver_accept_untrusted_certs = True
    driver = webdriver.Safari(options=options)
    print("SUCCESS: Safari WebDriver started!")
    driver.get("https://www.apple.com")
    print("SUCCESS: Page loaded!")
    time.sleep(2)
    driver.quit()
    print("SUCCESS: Safari WebDriver works!")
except Exception as e:
    print(f"FAILED: {e}")
