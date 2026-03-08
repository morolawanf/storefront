import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CDN_BASE_URL = 'https://oeptest.b-cdn.net/';

function buildCdnUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CDN_BASE_URL}${cleanPath}`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);
}

async function loadGoogleFont(font: string, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error('Failed to load font data');
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get('name') || 'Product';
  const price = searchParams.get('price') || '0';
  const image = searchParams.get('image') || '';
  const discount = searchParams.get('discount') || '';
  const category = searchParams.get('category') || '';

  const priceNum = Number(price);
  const discountNum = Number(discount);
  const hasDiscount = discountNum > 0;
  const finalPrice = hasDiscount ? priceNum * (1 - discountNum / 100) : priceNum;

  const imageUrl = buildCdnUrl(image);

  // Collect all text that will be rendered to only load needed glyphs
  const allText = [
    name,
    formatPrice(finalPrice),
    hasDiscount ? formatPrice(priceNum) : '',
    hasDiscount ? `${discountNum}% OFF` : '',
    category,
    'Buy Now',
    'No Image',
    'R',
  ].join('');

  const fontData = await loadGoogleFont('Inter', allText);

  // Fetch logo
  let logoData: ArrayBuffer | null = null;
  try {
    const logoRes = await fetch(
      new URL('/images/brand/logoDark.png', req.nextUrl.origin).toString()
    );
    if (logoRes.ok) logoData = await logoRes.arrayBuffer();
  } catch {
    // Logo fetch failed, proceed without it
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          fontFamily: 'Inter',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F7F0 30%, #2D5016 70%, #1A3409 100%)',
          }}
        />

        {/* Decorative accent corner */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(45, 80, 22, 0.15)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -120,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            padding: '50px 60px',
            position: 'relative',
          }}
        >
          {/* Left side: Product info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              paddingRight: '40px',
              gap: '8px',
            }}
          >
            {/* Logo */}
            {logoData ? (
              <img
                src={`data:image/png;base64,${Buffer.from(logoData).toString('base64')}`}
                width={64}
                height={64}
                style={{ marginBottom: '16px' }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: '#2D5016',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: 'white',
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                R
              </div>
            )}

            {/* Category */}
            {category && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 18,
                  color: '#2D5016',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </div>
            )}

            {/* Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: '#1a1a1a',
                }}
              >
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span
                  style={{
                    fontSize: 24,
                    color: '#999',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatPrice(priceNum)}
                </span>
              )}
            </div>

            {/* Discount badge */}
            {hasDiscount && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    background: '#DC2626',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 6,
                  }}
                >
                  {discountNum}% OFF
                </div>
              </div>
            )}

            {/* Product Name */}
            <div
              style={{
                fontSize: name.length > 40 ? 32 : 40,
                fontWeight: 700,
                color: '#1a1a1a',
                lineHeight: 1.2,
                display: 'flex',
                maxWidth: '480px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name.length > 60 ? name.substring(0, 57) + '...' : name}
            </div>

            {/* Buy Now button */}
            <div
              style={{
                display: 'flex',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  background: '#2D5016',
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 600,
                  padding: '14px 40px',
                  borderRadius: 8,
                }}
              >
                Buy Now
              </div>
            </div>
          </div>

          {/* Right side: Product image */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '480px',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* Image frame */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                width: '380px',
                height: '380px',
                border: '3px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {imageUrl ? (
              <img
                src={imageUrl}
                width={360}
                height={360}
                style={{
                  objectFit: 'contain',
                  borderRadius: '8px',
                  position: 'relative',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  width: 360,
                  height: 360,
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2D5016',
                  fontSize: 24,
                }}
              >
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#2D5016',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  );
}
