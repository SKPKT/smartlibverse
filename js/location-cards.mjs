// These keys are the existing game zone IDs; artwork does not control navigation.
export const LOCATION_ART = Object.freeze({
  library: {file:'virtual-library.webp', label:'Virtual Library'},
  gallery: {file:'storytelling.webp', label:'Storytelling'},
  quiz: {file:'eduverse.webp', label:'Eduverse'},
  awards: {file:'trophy.webp', label:'Trophy'},
  garden: {file:'knowledge-garden.webp', label:'Knowledge Garden'},
  secret: {file:'secret-zone.webp', label:'Secret Zone'}
});

export function renderLocationCards(parent, zones, {secretLocked, currentZone, onSelect}) {
  const doc = parent.ownerDocument;
  const grid = doc.createElement('div');
  grid.className = 'location-grid';
  for (const zone of zones) {
    const art = LOCATION_ART[zone.id];
    if (!art) continue; // Plaza keeps its existing return control, not a seventh image.
    const locked = zone.id === 'secret' && secretLocked;
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'location-card';
    button.dataset.zone = zone.id;
    button.setAttribute('aria-label', `${zone.name} (${art.label})${locked ? ', terkunci. Lihat syarat membuka kawasan.' : ''}`);
    if (zone.id === currentZone) button.setAttribute('aria-current', 'location');
    const image = doc.createElement('img');
    image.src = `./assets/locations/${art.file}`;
    image.alt = ''; // The button already supplies its accessible name.
    image.width = 960;
    image.height = 640;
    image.decoding = 'async';
    image.draggable = false;
    button.append(image);
    if (locked) {
      const lock = doc.createElement('span');
      lock.className = 'location-lock';
      lock.setAttribute('aria-hidden', 'true');
      lock.textContent = '🔒';
      button.append(lock);
    }
    // Keep the existing map callback, including the original secret gate.
    button.addEventListener('click', () => onSelect(zone.id));
    grid.append(button);
  }
  parent.append(grid);
}
