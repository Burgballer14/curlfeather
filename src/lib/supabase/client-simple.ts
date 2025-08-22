// Simplified client without database dependency for initial setup
export const trackConversion = async (
  eventType: string,
  leadId?: string,
  value?: number,
  metadata?: Record<string, any>
) => {
  try {
    // Track with Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${eventType}`,
        'value': value,
        'currency': 'USD',
        'transaction_id': leadId,
      });
    }
    
    // Log for development
    console.log('Conversion tracked:', { eventType, leadId, value, metadata });
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
};

// Lead scoring utility
export const calculateLeadScore = (leadData: any): number => {
  let score = 0;
  
  // Budget scoring
  if (leadData.project_budget === 'Over $10000') score += 50;
  else if (leadData.project_budget === '$5000-$10000') score += 35;
  else if (leadData.project_budget === '$2000-$5000') score += 20;
  
  // Timeline urgency
  if (leadData.project_timeline === 'Within 1 week') score += 30;
  else if (leadData.project_timeline === 'Within 2 weeks') score += 20;
  else if (leadData.project_timeline === 'Within 1 month') score += 10;
  
  // Service complexity
  if (leadData.services?.installation && leadData.services?.taping) score += 20;
  if (leadData.services?.texture && leadData.services?.texture !== 'none') score += 15;
  
  // Contact information quality
  if (leadData.phone && leadData.email) score += 15;
  if (leadData.address) score += 10;
  
  // Project size (square footage)
  const sqft = parseFloat(leadData.room_length) * parseFloat(leadData.room_width);
  if (sqft > 500) score += 25;
  else if (sqft > 200) score += 15;
  else if (sqft > 100) score += 10;
  
  return Math.min(score, 100); // Cap at 100
};

// Pricing calculation utility
export const calculateProjectPricing = (formData: any) => {
  const length = parseFloat(formData.room_length);
  const width = parseFloat(formData.room_width);
  const height = parseFloat(formData.ceiling_height);
  
  // Calculate square footage
  const floorSqft = length * width;
  const wallSqft = (length * height * 2) + (width * height * 2);
  const totalSqft = floorSqft + wallSqft;
  
  // Base rates per square foot
  const rates = {
    installation: 0.70,
    taping: 0.70,
    spray_texture: 0.35,
    hand_texture: 0.55,
    smooth_texture: 0.80,
    materials: 0.65
  };
  
  let laborCost = 0;
  let materialCost = totalSqft * rates.materials;
  
  // Calculate labor costs based on selected services
  if (formData.services?.installation) {
    laborCost += totalSqft * rates.installation;
  }
  
  if (formData.services?.taping) {
    laborCost += totalSqft * rates.taping;
  }
  
  if (formData.services?.texture && formData.services.texture !== 'none') {
    const textureRate = rates[`${formData.services.texture}_texture` as keyof typeof rates] || rates.spray_texture;
    laborCost += totalSqft * textureRate;
  }
  
  const totalCost = laborCost + materialCost;
  
  return {
    square_footage: totalSqft,
    labor_cost: Math.round(laborCost * 100) / 100,
    material_cost: Math.round(materialCost * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    breakdown: {
      installation: formData.services?.installation ? Math.round(totalSqft * rates.installation * 100) / 100 : 0,
      taping: formData.services?.taping ? Math.round(totalSqft * rates.taping * 100) / 100 : 0,
      texture: formData.services?.texture && formData.services.texture !== 'none' 
        ? Math.round(totalSqft * (rates[`${formData.services.texture}_texture` as keyof typeof rates] || rates.spray_texture) * 100) / 100 
        : 0,
      materials: Math.round(materialCost * 100) / 100
    }
  };
};