
from playwright.sync_api import sync_playwright

def verify_controls():
    url = 'http://localhost:8080/index.html'
    print(f'Loading {url}')

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.goto(url)

        # Wait for start screen text
        try:
            page.wait_for_selector('#start-screen', timeout=5000)
            print('Start Screen found.')
        except:
            print('Start Screen NOT found.')

        # Wait for D-Pad
        try:
            page.wait_for_selector('#dpad', timeout=5000)
            print('D-Pad found.')
        except:
            print('D-Pad NOT found.')

        # Wait for Fire Button
        try:
            page.wait_for_selector('#btn-fire', timeout=5000)
            print('Fire Button found.')
        except:
            print('Fire Button NOT found.')

        page.screenshot(path='verification/controls_check.png')
        print('Screenshot taken: verification/controls_check.png')

        # Test Interaction
        # Click Start
        page.click('#start-screen')
        page.wait_for_timeout(1000)

        # Check if Game State changed (Game usually hides start screen text or changes it?)
        # My code hides it when in PLAY state.

        # Let's verify visibility of #start-screen
        visible = page.is_visible('#start-screen')
        print(f'Start Screen Visible after click: {visible}')

        # Now click fire button
        page.click('#btn-fire')
        page.wait_for_timeout(500)
        page.screenshot(path='verification/controls_fire.png')

        browser.close()

if __name__ == '__main__':
    verify_controls()
