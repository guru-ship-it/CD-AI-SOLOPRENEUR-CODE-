import sys
import time
import requests

def check_health(url, retries=5, delay=10):
    print(f"Health Check Target: {url}")
    
    for i in range(retries):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print("✅ Health Check Passed!")
                return True
            else:
                print(f"⚠️ Received status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection failed: {e}")
        
        if i < retries - 1:
            print(f"Retrying in {delay} seconds... ({i+1}/{retries})")
            time.sleep(delay)
    
    print("🚨 Health Check Failed after all retries.")
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python health_check.py <URL>")
        sys.exit(1)
        
    target_url = sys.argv[1]
    if not check_health(target_url):
        sys.exit(1)
