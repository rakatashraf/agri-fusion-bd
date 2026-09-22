const U = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=78`;

export const farmPhotos = {
  farmer: U('photo-1558289282-647de9fdf608'),
  rice: U('photo-1558289282-647de9fdf608'),
  wheat: U('photo-1779043151848-784c1bc6c780'),
  greenField: U('photo-1592982537447-7440770cbfc9'),
  irrigation: U('photo-1777058019395-8b455056f99c'),
  watering: U('photo-1722286092981-daad28048013'),
  pest: U('photo-1774427477281-9d4faf8d19d1'),
  storm: U('photo-1643918031463-7d04999e4c8c'),
  specialist: U('photo-1779043151848-784c1bc6c780'),
  aerial: U('photo-1524486361537-8ad15938e1a3')
};

export function cropPhoto(crop = '') {
  const value = crop.toLowerCase();

  if (value.includes('rice') || value.includes('ধান') || value.includes('aman')) return farmPhotos.rice;
  if (value.includes('wheat') || value.includes('গম')) return farmPhotos.wheat;
  if (value.includes('vegetable') || value.includes('সবজি') || value.includes('chili')) return farmPhotos.greenField;
  if (value.includes('jute') || value.includes('পাট')) return farmPhotos.greenField;
  if (value.includes('mustard') || value.includes('সরিষা')) return farmPhotos.greenField;
  if (value.includes('mung') || value.includes('মুগ') || value.includes('lentil') || value.includes('মসুর')) return farmPhotos.greenField;

  return farmPhotos.greenField;
}

export function rotationPhoto(index: number) {
  return [farmPhotos.rice, farmPhotos.greenField, farmPhotos.wheat][index % 3];
}
