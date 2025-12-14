import { NextResponse } from 'next/server';
import { loadProducts } from '@/lib/products-storage';

/**
 * GET /api/products
 * 
 * Public API to get all products from database
 */
export async function GET() {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8c389881-52ef-4ac5-9288-d85afd18b471',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/products/route.ts:11',message:'API GET entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const products = await loadProducts();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8c389881-52ef-4ac5-9288-d85afd18b471',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/products/route.ts:13',message:'Products loaded from DB',data:{productCount:products.length,sampleProduct:products[0]?{id:products[0].id,price:products[0].price,originalPrice:products[0].originalPrice}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ products });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8c389881-52ef-4ac5-9288-d85afd18b471',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/products/route.ts:16',message:'API error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('Error loading products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
