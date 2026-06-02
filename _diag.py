from playwright.sync_api import sync_playwright
import pathlib
errors=[]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1280,"height":900})
    pg.on("console", lambda m: errors.append(f"{m.type}: {m.text}"))
    pg.on("pageerror", lambda e: errors.append("PAGEERROR: "+str(e)))
    pg.goto(pathlib.Path("index.html").resolve().as_uri())
    pg.wait_for_timeout(900)
    # how many headings match the selector the JS uses?
    h2_direct = pg.eval_on_selector_all(".article-container > h2[id]", "els=>els.length")
    toc_links = pg.eval_on_selector_all("#toc ul li a", "els=>els.length")
    print("h2[id] direct children of .article-container:", h2_direct)
    print("TOC links generated:", toc_links)
    # is toc-wrap visible? what's its width?
    info = pg.eval_on_selector(".toc-wrap", "el=>{const s=getComputedStyle(el);const r=el.getBoundingClientRect();return {display:s.display, width:r.width, height:r.height}}")
    print("toc-wrap:", info)
    layout = pg.eval_on_selector(".article-layout", "el=>{const s=getComputedStyle(el);return {display:s.display, cols:s.gridTemplateColumns}}")
    print("article-layout:", layout)
    b.close()
print("CONSOLE/ERRORS:", errors if errors else "none")
