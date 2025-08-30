// Script to easily update product images
// Run this after adding your images to the images/products folder

const productImages = {
    // Peptides
    'BPC-157': 'images/products/peptides/bpc-157.jpg',
    'TB-500': 'images/products/peptides/tb-500.jpg',
    'GHK-Cu': 'images/products/peptides/ghk-cu.jpg',
    'PT-141': 'images/products/peptides/pt-141.jpg',
    'Melanotan II': 'images/products/peptides/melanotan-2.jpg',
    'Ipamorelin': 'images/products/peptides/ipamorelin.jpg',
    'CJC-1295': 'images/products/peptides/cjc-1295.jpg',
    'Semaglutide': 'images/products/peptides/semaglutide.jpg',
    
    // Bacteriostatic Water
    'Bacteriostatic Water 10ml': 'images/products/water/bacteriostatic-10ml.jpg',
    'Bacteriostatic Water 30ml': 'images/products/water/bacteriostatic-30ml.jpg',
    'Bacteriostatic Water 100ml': 'images/products/water/bacteriostatic-100ml.jpg',
    
    // Skin Care
    'GHK-Cu Copper Peptide Serum': 'images/products/skincare/ghk-cu-serum.jpg',
    'Melanotan Face Cream': 'images/products/skincare/melanotan-cream.jpg',
    'BPC-157 Healing Gel': 'images/products/skincare/bpc-157-gel.jpg',
    
    // Nasal Sprays
    'Semax Nasal Spray': 'images/products/sprays/semax-spray.jpg',
    'Thymosin Alpha-1 Spray': 'images/products/sprays/thymosin-spray.jpg',
    'BPC-157 Nasal Spray': 'images/products/sprays/bpc-157-spray.jpg'
};

// For now, use these free stock images from Unsplash
// These are direct links to peptide/medical vial images
const stockImages = {
    // Peptide vials - professional medical vial images
    'BPC-157': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    'TB-500': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    'GHK-Cu': 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400',
    'PT-141': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    'Melanotan II': 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=400',
    'Ipamorelin': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
    'CJC-1295': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    'Semaglutide': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
    
    // Water vials
    'Bacteriostatic Water 10ml': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400',
    'Bacteriostatic Water 30ml': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400',
    'Bacteriostatic Water 100ml': 'https://images.unsplash.com/photo-1609667542331-8c9a80f1f0e4?w=400',
    
    // Skincare products
    'GHK-Cu Copper Peptide Serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    'Melanotan Face Cream': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'BPC-157 Healing Gel': 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400',
    
    // Nasal sprays
    'Semax Nasal Spray': 'https://images.unsplash.com/photo-1559056199-5a47f60c5053?w=400',
    'Thymosin Alpha-1 Spray': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    'BPC-157 Nasal Spray': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400'
};

// Export for use in main script
window.productImages = productImages;
window.stockImages = stockImages;