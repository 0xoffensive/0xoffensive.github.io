import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import pool from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "atstovas") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (body.statusas && Object.keys(body).length === 1) {
      // Just updating status
      await pool.execute(
        "UPDATE skelbimai SET statusas = ? WHERE id_Skelbimas = ?",
        [body.statusas, parseInt(id)]
      );
    } else {
      // Updating full listing
      const {
        pavadinimas, aprasymas, kaina, min_kiekis, vieta,
        amzius, aukstis, plotis, lotyniskas_pav, tipas, kilme, nuotrauka
      } = body;

      await pool.execute(
        `UPDATE skelbimai SET 
          pavadinimas = ?, aprasymas = ?, kaina = ?, min_kiekis = ?, 
          vieta = ?, amzius = ?, aukstis = ?, plotis = ?, 
          lotyniskas_pav = ?, tipas = ?, kilme = ?
         WHERE id_Skelbimas = ?`,
        [
          pavadinimas, aprasymas || null, kaina, min_kiekis || 1, 
          vieta || null, amzius || null, aukstis || null, plotis || null, 
          lotyniskas_pav || null, tipas || null, kilme || null,
          parseInt(id)
        ]
      );

      // handle image update if present
      if (nuotrauka) {
        // Simple logic: delete old, insert new
        const base64Data = nuotrauka.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        await pool.execute("DELETE FROM nuotraukos WHERE fk_Skelbimasid_Skelbimas = ?", [parseInt(id)]);
        await pool.execute("INSERT INTO nuotraukos (ref, fk_Skelbimasid_Skelbimas) VALUES (?, ?)", [buffer, parseInt(id)]);
      }
    }

    return NextResponse.json({ message: "Skelbimas atnaujintas" }, { status: 200 });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Serverio klaida" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "atstovas") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const listingId = parseInt(id);

    // Clean up relationships safely first
    await pool.execute("DELETE FROM nuotraukos WHERE fk_Skelbimasid_Skelbimas = ?", [listingId]);
    await pool.execute("DELETE FROM megstamiausi WHERE fk_Skelbimasid_Skelbimas = ?", [listingId]);
    
    // Delete listing
    await pool.execute("DELETE FROM skelbimai WHERE id_Skelbimas = ?", [listingId]);

    return NextResponse.json({ message: "Ištrinta sėkmingai" }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Klaida trinant skelbimą" }, { status: 500 });
  }
}