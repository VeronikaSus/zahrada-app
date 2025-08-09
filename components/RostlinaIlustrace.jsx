import Image from 'next/image';

export default function RostlinaIlustrace({ typ, isDraggable = false, onDragStart }) {
  // Mapování názvů rostlin na názvy souborů
  const getImagePath = (typ) => {
    const imageMap = {
      'rajce': '/components/vegetable_icons/rajcata.png',
      'mrkev': '/components/vegetable_icons/mrkev.png',
      'paprika': '/components/vegetable_icons/paprika.png',
      'okurka': '/components/vegetable_icons/okurka.png',
      'cibule': '/components/vegetable_icons/cibule.png',
      'cesnek': '/components/vegetable_icons/cesnek.png',
      'fazole': '/components/vegetable_icons/fazole.png',
      'hrach': '/components/vegetable_icons/hrasek.png',
      'brambory': '/components/vegetable_icons/brambory.png',
      'cuketa': '/components/vegetable_icons/cuketa.png',
      'dyne': '/components/vegetable_icons/dyne.png',
      'meloun': '/components/vegetable_icons/meloun.png',
      'jahody': '/components/vegetable_icons/jahody.png',
      'kapusta': '/components/vegetable_icons/ruzickova_kapusta.png',
      // Fallback pro neznámé rostliny
      'default': '/components/vegetable_icons/rajcata.png'
    };

    return imageMap[typ.toLowerCase()] || imageMap['default'];
  };

  const handleDragStart = (e) => {
    if (isDraggable && onDragStart) {
      onDragStart(e, typ);
    }
  };

  return (
    <div 
      className={`w-12 h-12 relative flex items-center justify-center ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <Image
        src={getImagePath(typ)}
        alt={typ}
        width={48}
        height={48}
        className="object-contain"
        onError={(e) => {
          // Fallback na default obrázek při chybě
          e.target.src = '/components/vegetable_icons/rajcata.png';
        }}
      />
    </div>
  );
} 