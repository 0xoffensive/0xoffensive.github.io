import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || ((session.user as any).role !== "atstovas" && (session.user as any).role !== "administratorius")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // atstovas sees own listings, administratorius sees all
    if ((session.user as any).role === "administratorius") {
      const [skelbimai] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          s.*,
          (SELECT ref FROM nuotraukos n WHERE n.fk_Skelbimasid_Skelbimas = s.id_Skelbimas LIMIT 1) as nuotrauka
        FROM skelbimai s
        ORDER BY s.data DESC
      `);

      const formattedSkelbimai = skelbimai.map((sk) => {
        let base64Image = null;
        if (sk.nuotrauka) {
          const buffer = Buffer.from(sk.nuotrauka);
          base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        }
        return {
          ...sk,
          nuotrauka: base64Image,
        };
      });

      return NextResponse.json(formattedSkelbimai);
    }

    const userId = (session.user as any).id || session.user.email;
    
    const [imones] = await pool.execute<RowDataPacket[]>(
      "SELECT id_Imone FROM imones WHERE fk_Vartotojasid_Vartotojas = ?",
      [userId]
    );

    if (imones.length === 0) {
      return NextResponse.json([]);
    }

    const imoneId = imones[0].id_Imone;

    const [skelbimai] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        s.*,
        (SELECT ref FROM nuotraukos n WHERE n.fk_Skelbimasid_Skelbimas = s.id_Skelbimas LIMIT 1) as nuotrauka
      FROM skelbimai s
      WHERE s.fk_Imoneid_Imone = ?
      ORDER BY s.data DESC
    `, [imoneId]);

    const formattedSkelbimai = skelbimai.map((sk) => {
      let base64Image = null;

      if (sk.nuotrauka) {
        // 1. Convert the Buffer from MySQL to a Base64 string
        // 'sk.nuotrauka' here is the BLOB data from your subquery
        const buffer = Buffer.from(sk.nuotrauka);
        base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      }

      return {
        ...sk,
        nuotrauka: base64Image
      };
    });

    return NextResponse.json(formattedSkelbimai);
  } catch (error) {
    console.error("My Listings Error:", error);
    return NextResponse.json({ error: "Klaida" }, { status: 500 });
  }
}