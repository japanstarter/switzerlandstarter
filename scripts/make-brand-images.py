# Regenerates logo.png and og-default.png for Japan Starter.  python3 scripts/make-brand-images.py
from PIL import Image, ImageDraw, ImageFont
A = "src/static/assets/"
NAVY=(29,36,51); RED=(230,57,70); CREAM=(250,247,242); PINK=(255,209,220)
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def torii(d, cx, top, w, col):
    # simple torii gate centred on cx
    h=w*0.95; t=w*0.11
    d.rounded_rectangle([cx-w/2, top, cx+w/2, top+t], radius=t*0.3, fill=col)            # kasagi
    d.rectangle([cx-w*0.40, top+t*2.0, cx+w*0.40, top+t*2.8], fill=col)                   # nuki
    for x in (cx-w*0.30, cx+w*0.30):
        d.rectangle([x-t*0.5, top+t*0.9, x+t*0.5, top+h], fill=col)                        # pillars

def mark(size):
    S=size*4; im=Image.new("RGBA",(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,S-1,S-1], radius=S*0.22, fill=NAVY)
    r=S*0.27; cx=S/2; cy=S*0.44
    d.ellipse([cx-r,cy-r,cx+r,cy+r], fill=RED)
    torii(d, cx, S*0.30, S*0.56, CREAM)
    # dotted "start here" path leading up to the gate
    for i,(x,y) in enumerate([(0.50,0.90),(0.50,0.83)]):
        pass
    d.rounded_rectangle([S*0.18,S*0.84,S*0.82,S*0.87], radius=S*0.015, fill=CREAM)        # ground line
    return im.resize((size,size), Image.LANCZOS)

mark(512).save(A+"logo.png")

W,H=1200,630; S=2
og=Image.new("RGB",(W*S,H*S),NAVY); d=ImageDraw.Draw(og)
for y in range(H*S):  # vertical gradient
    t=y/(H*S); c=tuple(int(a+(b-a)*t) for a,b in zip((30,52,88),(62,90,128))); d.line([(0,y),(W*S,y)], fill=c)
cx,cy,r=900*S,250*S,130*S
d.ellipse([cx-r,cy-r,cx+r,cy+r], fill=RED)
torii(d, cx, 170*S, 300*S, CREAM)
d.rectangle([700*S,460*S,1100*S,468*S], fill=CREAM)
fT=ImageFont.truetype(SERIF,96*S); fS=ImageFont.truetype(SERIF,36*S); fE=ImageFont.truetype(SANS,26*S)
d.text((70*S,150*S),"START HERE · FIRST TRIP GUIDE", font=fE, fill=PINK)
d.text((66*S,200*S),"Japan", font=fT, fill=(255,255,255))
d.text((66*S,310*S),"Starter", font=fT, fill=(255,255,255))
d.text((70*S,440*S),"The friendly start-here guide", font=fS, fill=PINK)
d.text((70*S,488*S),"for your first trip to Japan", font=fS, fill=PINK)
d.text((70*S,560*S),"japanstarter.com", font=fE, fill=(200,210,228))
og.resize((W,H), Image.LANCZOS).save(A+"og-default.png", optimize=True)
