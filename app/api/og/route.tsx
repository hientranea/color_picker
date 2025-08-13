import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Get color parameters from the request
    const color = searchParams.get("color") || "#000000";
    const name = searchParams.get("name") || "Color";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
          }}
        >
          {/* Color swatch */}
          <div
            style={{
              display: "flex",
              width: "80%",
              height: "60%",
              backgroundColor: color,
              borderRadius: "24px",
              marginBottom: "40px",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            }}
          />

          {/* Color information */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontSize: "64px",
                color: "#333",
                margin: "0",
                marginBottom: "16px",
              }}
            >
              {name}
            </h1>
            <p
              style={{
                fontSize: "32px",
                color: "#666",
                margin: "0",
              }}
            >
              {color}
            </p>
          </div>

          {/* Branding */}
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              right: "32px",
              fontSize: "24px",
              color: "#999",
            }}
          >
            colorpicker.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
