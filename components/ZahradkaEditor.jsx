'use client';

import { useState, useRef, useEffect } from 'react';

export default function ZahradkaEditor({ savedBeds, setSavedBeds, loadPlanData, onPlanLoaded }) {
  const [gardenSize, setGardenSize] = useState({ width: 10, height: 8 });
  const [beds, setBeds] = useState([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentBed, setCurrentBed] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [editingBed, setEditingBed] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, bedId: null, plantId: null });
  const [hoveredBed, setHoveredBed] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDimensions, setManualDimensions] = useState({ width: 100, height: 100 });
  const [bedPlants, setBedPlants] = useState({}); // Mapování bedId -> array of plants
  const [draggedPlant, setDraggedPlant] = useState(null); // Rostlina, která se právě přesouvá
  const [dragPlantOffset, setDragPlantOffset] = useState({ x: 0, y: 0 }); // Offset pro přesouvání rostlin
  const [showSavePlanDialog, setShowSavePlanDialog] = useState(false); // Dialog pro uložení celého plánu
  const [showLoadPlanDialog, setShowLoadPlanDialog] = useState(false); // Dialog pro načtení plánu
  const [planName, setPlanName] = useState(''); // Název plánu
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate canvas dimensions based on container with 1px = 1cm scale
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 800 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const maxWidth = container.clientWidth - 40; // Account for padding
        const maxHeight = 800; // Max height for canvas
        
        // 1px = 1cm, so 1m = 100px
        const scale = 100; // 100px per meter (1px = 1cm)
        
        // Calculate canvas size based on garden dimensions
        const calculatedWidth = gardenSize.width * scale;
        const calculatedHeight = gardenSize.height * scale;
        
        // Limit canvas size to fit in container
        const finalWidth = Math.min(calculatedWidth, maxWidth);
        const finalHeight = Math.min(calculatedHeight, maxHeight);
        
        setCanvasSize({
          width: finalWidth,
          height: finalHeight
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [gardenSize]);

  // Hide context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, bedId: null, plantId: null });
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedBed) {
        if (e.ctrlKey && e.key === 'c') {
          e.preventDefault();
          copyBed(selectedBed.id);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          deleteBed(selectedBed.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBed]);

  // Load plan when loadPlanData changes
  useEffect(() => {
    if (loadPlanData) {
      loadCompletePlan(loadPlanData);
      onPlanLoaded();
    }
  }, [loadPlanData, onPlanLoaded]);

  // Calculate scale for display
  const getScale = () => {
    return canvasSize.width / gardenSize.width;
  };

  // Convert screen coordinates to garden coordinates
  const screenToGarden = (screenX, screenY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const x = (screenX - rect.left) / canvasSize.width * gardenSize.width;
    const y = (screenY - rect.top) / canvasSize.height * gardenSize.height;
    
    return { x: Math.max(0, Math.min(x, gardenSize.width)), y: Math.max(0, Math.min(y, gardenSize.height)) };
  };

  // Convert garden coordinates to screen coordinates
  const gardenToScreen = (gardenX, gardenY) => {
    const x = (gardenX / gardenSize.width) * canvasSize.width;
    const y = (gardenY / gardenSize.height) * canvasSize.height;
    return { x, y };
  };

  // Format dimensions for display
  const formatDimensions = (width, height) => {
    const w = Math.round(width * 100);
    const h = Math.round(height * 100);
    return `${w}cm × ${h}cm`;
  };

  // Handle mouse down
  const handleMouseDown = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const gardenPos = screenToGarden(e.clientX, e.clientY);
    
    if (selectedTool === 'draw') {
      setIsDrawing(true);
      setDrawStart(gardenPos);
      setCurrentBed({
        x: gardenPos.x,
        y: gardenPos.y,
        width: 0,
        height: 0
      });
    } else if (selectedTool === 'select') {
      // Check if clicking on resize handle of selected bed
      if (selectedBed) {
        const handle = getResizeHandle(mouseX, mouseY, selectedBed);
        if (handle) {
          setResizeHandle(handle);
          setIsResizing(true);
          return;
        }
      }
      
      // Check if clicking on existing bed to select for editing
      const clickedBed = beds.find(bed => 
        gardenPos.x >= bed.x && gardenPos.x <= bed.x + bed.width &&
        gardenPos.y >= bed.y && gardenPos.y <= bed.y + bed.height
      );
      
      if (clickedBed) {
        setSelectedBed(clickedBed);
        // Calculate drag offset
        setDragOffset({
          x: gardenPos.x - clickedBed.x,
          y: gardenPos.y - clickedBed.y
        });
        setIsDragging(true);
      } else {
        setSelectedBed(null);
      }
    }
    
    // Hide context menu on any click
    setContextMenu({ show: false, x: 0, y: 0, bedId: null });
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (isDrawing && drawStart && currentBed) {
      const gardenPos = screenToGarden(e.clientX, e.clientY);
      
      setCurrentBed({
        x: Math.min(drawStart.x, gardenPos.x),
        y: Math.min(drawStart.y, gardenPos.y),
        width: Math.abs(gardenPos.x - drawStart.x),
        height: Math.abs(gardenPos.y - drawStart.y)
      });
    }
    
    // Handle dragging
    if (isDragging && selectedBed) {
      const gardenPos = screenToGarden(e.clientX, e.clientY);
      const newX = gardenPos.x - dragOffset.x;
      const newY = gardenPos.y - dragOffset.y;
      
      // Constrain to garden boundaries
      const constrainedX = Math.max(0, Math.min(newX, gardenSize.width - selectedBed.width));
      const constrainedY = Math.max(0, Math.min(newY, gardenSize.height - selectedBed.height));
      
      setSelectedBed({
        ...selectedBed,
        x: constrainedX,
        y: constrainedY
      });
    }
    
    // Handle resizing
    if (isResizing && selectedBed && resizeHandle) {
      const gardenPos = screenToGarden(e.clientX, e.clientY);
      let newX = selectedBed.x;
      let newY = selectedBed.y;
      let newWidth = selectedBed.width;
      let newHeight = selectedBed.height;
      
      switch (resizeHandle) {
        case 'nw':
          newWidth = selectedBed.x + selectedBed.width - gardenPos.x;
          newHeight = selectedBed.y + selectedBed.height - gardenPos.y;
          newX = gardenPos.x;
          newY = gardenPos.y;
          break;
        case 'ne':
          newWidth = gardenPos.x - selectedBed.x;
          newHeight = selectedBed.y + selectedBed.height - gardenPos.y;
          newY = gardenPos.y;
          break;
        case 'sw':
          newWidth = selectedBed.x + selectedBed.width - gardenPos.x;
          newHeight = gardenPos.y - selectedBed.y;
          newX = gardenPos.x;
          break;
        case 'se':
          newWidth = gardenPos.x - selectedBed.x;
          newHeight = gardenPos.y - selectedBed.y;
          break;
      }
      
      // Constrain minimum size and garden boundaries
      newWidth = Math.max(0.1, Math.min(newWidth, gardenSize.width - newX));
      newHeight = Math.max(0.1, Math.min(newHeight, gardenSize.height - newY));
      newX = Math.max(0, Math.min(newX, gardenSize.width - newWidth));
      newY = Math.max(0, Math.min(newY, gardenSize.height - newHeight));
      
      const updatedBed = {
        ...selectedBed,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      };
      
      setSelectedBed(updatedBed);
      
      // Update mouse position for live dimensions display
      setMousePosition({ x: e.clientX - (canvasRef.current?.getBoundingClientRect()?.left || 0), y: e.clientY - (canvasRef.current?.getBoundingClientRect()?.top || 0) });
    }
    
    // Handle plant dragging
    if (draggedPlant) {
      updatePlantPosition(e);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDrawing && currentBed && currentBed.width > 0.1 && currentBed.height > 0.1) {
      const newBed = { ...currentBed, id: Date.now() };
      setBeds([...beds, newBed]);
      // Auto-select the newly created bed
      setSelectedBed(newBed);
      setSelectedTool('select');
    }
    
    // Handle drag completion
    if (isDragging && selectedBed) {
      setBeds(beds.map(bed => 
        bed.id === selectedBed.id ? selectedBed : bed
      ));
      setIsDragging(false);
    }
    
    // Handle resize completion
    if (isResizing && selectedBed) {
      setBeds(beds.map(bed => 
        bed.id === selectedBed.id ? selectedBed : bed
      ));
      setIsResizing(false);
      setResizeHandle(null);
    }
    
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentBed(null);
    setContextMenu({ show: false, x: 0, y: 0, bedId: null, plantId: null });
    
    // Stop plant dragging
    if (draggedPlant) {
      stopPlantDrag();
    }
  };

  // Handle double click for editing
  const handleDoubleClick = (e) => {
    const gardenPos = screenToGarden(e.clientX, e.clientY);
    const clickedBed = beds.find(bed => 
      gardenPos.x >= bed.x && gardenPos.x <= bed.x + bed.width &&
      gardenPos.y >= bed.y && gardenPos.y <= bed.y + bed.height
    );
    
    if (clickedBed) {
      setEditingBed(clickedBed);
    }
  };

  // Update bed dimensions
  const updateBed = (bedId, newDimensions) => {
    setBeds(beds.map(bed => 
      bed.id === bedId ? { ...bed, ...newDimensions } : bed
    ));
    setEditingBed(null);
  };

  // Delete bed
  const deleteBed = (bedId) => {
    setBeds(beds.filter(bed => bed.id !== bedId));
    setEditingBed(null);
    setSelectedBed(null);
  };

  // Copy bed
  const copyBed = (bedId) => {
    const bedToCopy = beds.find(bed => bed.id === bedId);
    if (bedToCopy) {
      const newBed = {
        ...bedToCopy,
        id: Date.now(),
        x: bedToCopy.x + 0.5, // Offset slightly
        y: bedToCopy.y + 0.5
      };
      setBeds([...beds, newBed]);
    }
  };

  // Save bed to saved beds
  const saveBed = (bedId) => {
    const bedToSave = beds.find(bed => bed.id === bedId);
    if (bedToSave) {
      const savedBed = {
        ...bedToSave,
        id: Date.now(),
        name: `Záhon ${savedBeds.length + 1}`,
        savedAt: new Date().toISOString()
      };
      setSavedBeds([...savedBeds, savedBed]);
    }
  };

  // Uložení celého osevního plánu
  const saveCompletePlan = (name) => {
    const completePlan = {
      id: Date.now(),
      name: name,
      savedAt: new Date().toISOString(),
      gardenSize: gardenSize,
      beds: beds,
      bedPlants: bedPlants
    };
    
    // Uložit do localStorage
    const existingPlans = JSON.parse(localStorage.getItem('osevniPlany') || '[]');
    const updatedPlans = [...existingPlans, completePlan];
    localStorage.setItem('osevniPlany', JSON.stringify(updatedPlans));
    
    setShowSavePlanDialog(false);
    setPlanName('');
    
    // Zobrazit potvrzení
    alert(`Osevní plán "${name}" byl úspěšně uložen!`);
    
    // Pokud je otevřený dialog pro načítání, aktualizovat ho
    if (showLoadPlanDialog) {
      // Force re-render LoadPlanDialog
      setShowLoadPlanDialog(false);
      setTimeout(() => setShowLoadPlanDialog(true), 100);
    }
  };

  // Načtení celého osevního plánu
  const loadCompletePlan = (plan) => {
    setGardenSize(plan.gardenSize);
    setBeds(plan.beds);
    setBedPlants(plan.bedPlants);
    setSelectedBed(null);
    setEditingBed(null);
  };

  // Získání uložených plánů
  const getSavedPlans = () => {
    return JSON.parse(localStorage.getItem('osevniPlany') || '[]');
  };

  // Smazání uloženého plánu
  const deleteSavedPlan = (planId) => {
    const existingPlans = JSON.parse(localStorage.getItem('osevniPlany') || '[]');
    const updatedPlans = existingPlans.filter(plan => plan.id !== planId);
    localStorage.setItem('osevniPlany', JSON.stringify(updatedPlans));
  };

  // Load saved bed to garden
  const loadSavedBed = (savedBed) => {
    const newBed = {
      ...savedBed,
      id: Date.now(),
      x: 1, // Place at reasonable position
      y: 1
    };
    setBeds([...beds, newBed]);
  };

  // Funkce pro práci s rostlinami v záhonech
  const addPlantToBed = (bedId, plantType, x = null, y = null) => {
    const newPlant = {
      id: Date.now() + Math.random(),
      type: plantType,
      x: x !== null ? x : Math.random() * 0.8 + 0.1, // Použít přesnou pozici nebo náhodnou
      y: y !== null ? y : Math.random() * 0.8 + 0.1
    };
    
    console.log('Adding plant:', {
      bedId, plantType, x, y,
      finalX: newPlant.x, finalY: newPlant.y
    });
    
    setBedPlants(prev => ({
      ...prev,
      [bedId]: [...(prev[bedId] || []), newPlant]
    }));
  };

  const removePlantFromBed = (bedId, plantId) => {
    setBedPlants(prev => ({
      ...prev,
      [bedId]: (prev[bedId] || []).filter(plant => plant.id !== plantId)
    }));
  };

  const copyPlantInBed = (bedId, plantId) => {
    const plants = bedPlants[bedId] || [];
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
      const newPlant = {
        ...plant,
        id: Date.now() + Math.random(),
        x: Math.min(plant.x + 0.1, 0.9),
        y: Math.min(plant.y + 0.1, 0.9)
      };
      setBedPlants(prev => ({
        ...prev,
        [bedId]: [...plants, newPlant]
      }));
    }
  };

  // Funkce pro přesouvání rostlin v záhonu
  const startPlantDrag = (e, bedId, plantId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const plants = bedPlants[bedId] || [];
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
      setDraggedPlant({ bedId, plantId, plant });
      
      // Vypočítat offset od pozice rostliny
      const rect = canvasRef.current.getBoundingClientRect();
      const bedScreenPos = gardenToScreen(bed.x, bed.y);
      const bedScreenSize = gardenToScreen(bed.width, bed.height);
      const plantScreenX = bedScreenPos.x + plant.x * bedScreenSize.x;
      const plantScreenY = bedScreenPos.y + plant.y * bedScreenSize.y;
      
      setDragPlantOffset({
        x: e.clientX - rect.left - plantScreenX,
        y: e.clientY - rect.top - plantScreenY
      });
    }
  };

  const updatePlantPosition = (e) => {
    if (draggedPlant) {
      const rect = canvasRef.current.getBoundingClientRect();
      const bed = beds.find(b => b.id === draggedPlant.bedId);
      
      if (bed) {
        const bedScreenPos = gardenToScreen(bed.x, bed.y);
        const bedScreenSize = gardenToScreen(bed.width, bed.height);
        
        // Vypočítat novou pozici rostliny
        const newPlantScreenX = e.clientX - rect.left - dragPlantOffset.x;
        const newPlantScreenY = e.clientY - rect.top - dragPlantOffset.y;
        
        // Převést na relativní pozici v záhonu
        const newRelativeX = (newPlantScreenX - bedScreenPos.x) / bedScreenSize.x;
        const newRelativeY = (newPlantScreenY - bedScreenPos.y) / bedScreenSize.y;
        
        // Omezit na hranice záhonu
        const clampedX = Math.max(0.05, Math.min(0.95, newRelativeX));
        const clampedY = Math.max(0.05, Math.min(0.95, newRelativeY));
        
        // Aktualizovat pozici rostliny
        setBedPlants(prev => ({
          ...prev,
          [draggedPlant.bedId]: (prev[draggedPlant.bedId] || []).map(plant =>
            plant.id === draggedPlant.plantId
              ? { ...plant, x: clampedX, y: clampedY }
              : plant
          )
        }));
      }
    }
  };

  const stopPlantDrag = () => {
    setDraggedPlant(null);
    setDragPlantOffset({ x: 0, y: 0 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // Tato funkce se spustí pouze pokud drop neproběhl přímo na záhonu
    console.log('Global drop - no bed selected or drop outside beds');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleBedDrop = (e, bed) => {
    e.preventDefault();
    e.stopPropagation();
    
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const dropData = JSON.parse(data);
        if (dropData.type === 'rostlina') {
          // Získat přesné souřadnice drop pozice
          const rect = canvasRef.current.getBoundingClientRect();
          const dropX = e.clientX - rect.left;
          const dropY = e.clientY - rect.top;
          
          // Převést na souřadnice v záhonu
          const bedScreenPos = gardenToScreen(bed.x, bed.y);
          const bedScreenSize = gardenToScreen(bed.width, bed.height);
          
          // Vypočítat relativní pozici v záhonu (0-1)
          const relativeX = (dropX - bedScreenPos.x) / bedScreenSize.x;
          const relativeY = (dropY - bedScreenPos.y) / bedScreenSize.y;
          
          // Debug informace
          console.log('Bed drop debug:', {
            bedId: bed.id,
            dropX, dropY,
            bedScreenPos, bedScreenSize,
            relativeX, relativeY
          });
          
          // Omezit pozici na hranice záhonu
          const clampedX = Math.max(0.05, Math.min(0.95, relativeX));
          const clampedY = Math.max(0.05, Math.min(0.95, relativeY));
          
          addPlantToBed(bed.id, dropData.rostlinaTyp, clampedX, clampedY);
        }
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    }
  };

  // Create bed with manual dimensions
  const createManualBed = () => {
    // Convert to numbers and validate
    const width = typeof manualDimensions.width === 'string' 
      ? parseFloat(manualDimensions.width) 
      : manualDimensions.width;
    const height = typeof manualDimensions.height === 'string' 
      ? parseFloat(manualDimensions.height) 
      : manualDimensions.height;

    // Validation
    if (!width || !height || width < 10 || height < 10 || width > 1000 || height > 1000) {
      console.error('Invalid dimensions for manual bed creation');
      return;
    }

    const newBed = {
      id: Date.now(),
      x: 1,
      y: 1,
      width: width / 100, // Convert cm to meters
      height: height / 100,
      name: `Záhon ${beds.length + 1}`
    };
    
    setBeds([...beds, newBed]);
    setShowManualInput(false);
    setManualDimensions({ width: 100, height: 100 });
    
    // Auto-select the newly created bed and switch to select tool
    setSelectedBed(newBed);
    setSelectedTool('select');
  };

  // Handle context menu
  const handleContextMenu = (e, bedId) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      bedId: bedId,
      plantId: null
    });
  };

  // Check if point is near a resize handle
  const getResizeHandle = (x, y, bed) => {
    const screenPos = gardenToScreen(bed.x, bed.y);
    const screenSize = gardenToScreen(bed.width, bed.height);
    const handleSize = 8;
    
    // Check corners
    if (Math.abs(x - screenPos.x) < handleSize && Math.abs(y - screenPos.y) < handleSize) return 'nw';
    if (Math.abs(x - (screenPos.x + screenSize.x)) < handleSize && Math.abs(y - screenPos.y) < handleSize) return 'ne';
    if (Math.abs(x - screenPos.x) < handleSize && Math.abs(y - (screenPos.y + screenSize.y)) < handleSize) return 'sw';
    if (Math.abs(x - (screenPos.x + screenSize.x)) < handleSize && Math.abs(y - (screenPos.y + screenSize.y)) < handleSize) return 'se';
    
    return null;
  };

  // Handle mouse enter/leave for hover effects
  const handleMouseEnter = (bedId) => {
    setHoveredBed(bedId);
  };

  const handleMouseLeave = () => {
    setHoveredBed(null);
  };

  // Render beds
  const renderBeds = () => {
    return beds.map((bed) => {
      const screenPos = gardenToScreen(bed.x, bed.y);
      const screenSize = gardenToScreen(bed.width, bed.height);
      const isSelected = editingBed?.id === bed.id;
      const isBeingDragged = selectedBed?.id === bed.id;
      const isHovered = hoveredBed === bed.id;
      const isSelectedForEdit = selectedBed?.id === bed.id;
      
      // Use selectedBed position if being dragged
      const displayBed = isBeingDragged ? selectedBed : bed;
      const displayScreenPos = isBeingDragged ? gardenToScreen(displayBed.x, displayBed.y) : screenPos;
      
      return (
        <g key={bed.id}>
          <rect
            x={displayScreenPos.x}
            y={displayScreenPos.y}
            width={screenSize.x}
            height={screenSize.y}
            fill="#22c55e"
            stroke={isSelected ? "#dc2626" : isBeingDragged ? "#3b82f6" : isHovered ? "#f59e0b" : "#16a34a"}
            strokeWidth={isSelected ? 3 : isBeingDragged ? 3 : isHovered ? 3 : 2}
            opacity={isBeingDragged ? 0.9 : isHovered ? 0.9 : 0.8}
            className="cursor-pointer hover:opacity-100 transition-opacity"
            onDoubleClick={() => setEditingBed(bed)}
            onContextMenu={(e) => handleContextMenu(e, bed.id)}
            onMouseEnter={() => handleMouseEnter(bed.id)}
            onMouseLeave={handleMouseLeave}
            onDrop={(e) => handleBedDrop(e, bed)}
            onDragOver={handleDragOver}
          />
          
          {/* Bed dimensions */}
          <text
            x={displayScreenPos.x + screenSize.x / 2}
            y={displayScreenPos.y + screenSize.y / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-medium fill-white pointer-events-none"
            style={{ fontSize: '10px', fontWeight: 'bold' }}
          >
            {formatDimensions(displayBed.width, displayBed.height)}
          </text>
          
          {/* Hover actions */}
          {isHovered && !isSelectedForEdit && (
            <g>
              {/* Copy button */}
              <circle
                cx={displayScreenPos.x + screenSize.x - 15}
                cy={displayScreenPos.y + 15}
                r={12}
                fill="#3b82f6"
                className="cursor-pointer hover:fill-blue-600"
                onClick={() => copyBed(bed.id)}
              />
              <text
                x={displayScreenPos.x + screenSize.x - 15}
                y={displayScreenPos.y + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-white pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                📋
              </text>
              
              {/* Delete button */}
              <circle
                cx={displayScreenPos.x + screenSize.x - 15}
                cy={displayScreenPos.y + 35}
                r={12}
                fill="#ef4444"
                className="cursor-pointer hover:fill-red-600"
                onClick={() => deleteBed(bed.id)}
              />
              <text
                x={displayScreenPos.x + screenSize.x - 15}
                y={displayScreenPos.y + 35}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-white pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                🗑️
              </text>
            </g>
          )}
          
          {/* Selection indicator and resize handles */}
          {isSelectedForEdit && (
            <g>
              <rect
                x={displayScreenPos.x - 2}
                y={displayScreenPos.y - 2}
                width={screenSize.x + 4}
                height={screenSize.y + 4}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
              
              {/* Resize handles */}
              <circle
                cx={displayScreenPos.x}
                cy={displayScreenPos.y}
                r={4}
                fill="#3b82f6"
                className="cursor-nw-resize"
              />
              <circle
                cx={displayScreenPos.x + screenSize.x}
                cy={displayScreenPos.y}
                r={4}
                fill="#3b82f6"
                className="cursor-ne-resize"
              />
              <circle
                cx={displayScreenPos.x}
                cy={displayScreenPos.y + screenSize.y}
                r={4}
                fill="#3b82f6"
                className="cursor-sw-resize"
              />
              <circle
                cx={displayScreenPos.x + screenSize.x}
                cy={displayScreenPos.y + screenSize.y}
                r={4}
                fill="#3b82f6"
                className="cursor-se-resize"
              />
            </g>
          )}

          {/* Render plants in bed */}
          {(bedPlants[bed.id] || []).map((plant) => {
            const plantScreenPos = {
              x: displayScreenPos.x + plant.x * screenSize.x,
              y: displayScreenPos.y + plant.y * screenSize.y
            };
            
            const isBeingDragged = draggedPlant?.plantId === plant.id;
            const plantSize = isBeingDragged ? 32 : 28; // Zvětšené rostliny
            const plantOffset = plantSize / 2;
            
            return (
              <g key={plant.id}>
                {/* Plant icon */}
                <image
                  x={plantScreenPos.x - plantOffset}
                  y={plantScreenPos.y - plantOffset}
                  width={plantSize}
                  height={plantSize}
                  href={`/components/vegetable_icons/${plant.type}.png`}
                  className={`cursor-grab active:cursor-grabbing ${isBeingDragged ? 'opacity-80' : ''}`}
                  onMouseDown={(e) => startPlantDrag(e, bed.id, plant.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Show plant context menu
                    setContextMenu({
                      show: true,
                      x: e.clientX,
                      y: e.clientY,
                      bedId: bed.id,
                      plantId: plant.id
                    });
                  }}
                />
                
                {/* Plant actions (show on hover) */}
                <g className="opacity-0 hover:opacity-100 transition-opacity">
                  {/* Copy plant button */}
                  <circle
                    cx={plantScreenPos.x + plantOffset + 8}
                    cy={plantScreenPos.y - plantOffset - 8}
                    r={8}
                    fill="#3b82f6"
                    className="cursor-pointer hover:fill-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPlantInBed(bed.id, plant.id);
                    }}
                  />
                  <text
                    x={plantScreenPos.x + plantOffset + 8}
                    y={plantScreenPos.y - plantOffset - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-white pointer-events-none"
                    style={{ fontSize: '8px' }}
                  >
                    📋
                  </text>
                  
                  {/* Delete plant button */}
                  <circle
                    cx={plantScreenPos.x + plantOffset + 8}
                    cy={plantScreenPos.y + plantOffset + 8}
                    r={8}
                    fill="#ef4444"
                    className="cursor-pointer hover:fill-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlantFromBed(bed.id, plant.id);
                    }}
                  />
                  <text
                    x={plantScreenPos.x + plantOffset + 8}
                    y={plantScreenPos.y + plantOffset + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-white pointer-events-none"
                    style={{ fontSize: '8px' }}
                  >
                    🗑️
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      );
    });
  };

  // Render grid
  const renderGrid = () => {
    const gridSize = 100; // 1m = 100px (1px = 1cm)
    const lines = [];
    
    // Vertical lines (every meter)
    for (let x = gridSize; x < canvasSize.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasSize.height}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    // Horizontal lines (every meter)
    for (let y = gridSize; y < canvasSize.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasSize.width}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    // Centimeter grid (every 10cm = 10px)
    const cmGridSize = 10;
    for (let x = cmGridSize; x < canvasSize.width; x += cmGridSize) {
      lines.push(
        <line
          key={`cv-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasSize.height}
          stroke="#f3f4f6"
          strokeWidth={0.5}
        />
      );
    }
    
    for (let y = cmGridSize; y < canvasSize.height; y += cmGridSize) {
      lines.push(
        <line
          key={`ch-${y}`}
          x1={0}
          y1={y}
          x2={canvasSize.width}
          y2={y}
          stroke="#f3f4f6"
          strokeWidth={0.5}
        />
      );
    }
    
    // Meter indicators
    const meterIndicators = [];
    
    // Vertical meter indicators (top edge)
    for (let x = gridSize; x < canvasSize.width; x += gridSize) {
      const meter = Math.floor(x / gridSize);
      meterIndicators.push(
        <text
          key={`vm-${x}`}
          x={x}
          y={15}
          textAnchor="middle"
          className="text-xs fill-gray-500 pointer-events-none"
          style={{ fontSize: '10px' }}
        >
          {meter}m
        </text>
      );
    }
    
    // Horizontal meter indicators (left edge)
    for (let y = gridSize; y < canvasSize.height; y += gridSize) {
      const meter = Math.floor(y / gridSize);
      meterIndicators.push(
        <text
          key={`hm-${y}`}
          x={15}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-500 pointer-events-none"
          style={{ fontSize: '10px' }}
        >
          {meter}m
        </text>
      );
    }
    
    return [...lines, ...meterIndicators];
  };

  // Render current bed being drawn
  const renderCurrentBed = () => {
    if (!currentBed || currentBed.width === 0 || currentBed.height === 0) return null;
    
    const screenPos = gardenToScreen(currentBed.x, currentBed.y);
    const screenSize = gardenToScreen(currentBed.width, currentBed.height);
    
    return (
      <g>
        <rect
          x={screenPos.x}
          y={screenPos.y}
          width={screenSize.x}
          height={screenSize.y}
          fill="#22c55e"
          stroke="#16a34a"
          strokeWidth={2}
          opacity={0.6}
          strokeDasharray="5,5"
        />
        {/* Live dimensions display */}
        <text
          x={mousePosition.x + 10}
          y={mousePosition.y - 10}
          className="text-xs font-medium fill-gray-800 pointer-events-none"
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
          {formatDimensions(currentBed.width, currentBed.height)}
        </text>
      </g>
    );
  };

  // Render live dimensions during resize
  const renderLiveDimensions = () => {
    if (!isResizing || !selectedBed) return null;
    
    return (
      <text
        x={mousePosition.x + 10}
        y={mousePosition.y - 10}
        className="text-xs font-medium fill-blue-600 pointer-events-none"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {formatDimensions(selectedBed.width, selectedBed.height)}
      </text>
    );
  };

  // Manual input dialog component
  const ManualInputDialog = ({ onSave, onCancel }) => {
    const [localDimensions, setLocalDimensions] = useState({ width: 100, height: 100 });
    const [widthInput, setWidthInput] = useState('100');
    const [heightInput, setHeightInput] = useState('100');
    const [widthError, setWidthError] = useState(false);
    const [heightError, setHeightError] = useState(false);

    // Initialize input values when dialog opens
    useEffect(() => {
      setWidthInput('100');
      setHeightInput('100');
      setLocalDimensions({ width: 100, height: 100 });
      setWidthError(false);
      setHeightError(false);
    }, []);

    const validateInput = (value) => {
      if (value === '') return { isValid: true, value: 0 };
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return { isValid: false, value: 0 };
      if (numValue < 10 || numValue > 1000) return { isValid: false, value: numValue };
      return { isValid: true, value: numValue };
    };

    const handleWidthChange = (e) => {
      const value = e.target.value;
      setWidthInput(value);
      
      // Simplified validation
      const numValue = value === '' ? 0 : parseFloat(value);
      const isValid = !isNaN(numValue) && numValue >= 10 && numValue <= 1000;
      setWidthError(!isValid);
      setLocalDimensions(prev => ({ ...prev, width: numValue }));
    };

    const handleHeightChange = (e) => {
      const value = e.target.value;
      setHeightInput(value);
      
      // Simplified validation
      const numValue = value === '' ? 0 : parseFloat(value);
      const isValid = !isNaN(numValue) && numValue >= 10 && numValue <= 1000;
      setHeightError(!isValid);
      setLocalDimensions(prev => ({ ...prev, height: numValue }));
    };

    const isValid = localDimensions.width >= 10 && localDimensions.height >= 10 && 
                   localDimensions.width <= 1000 && localDimensions.height <= 1000 &&
                   !widthError && !heightError;

    const handleSave = () => {
      if (isValid) {
        setManualDimensions({ width: localDimensions.width, height: localDimensions.height });
        onSave();
      }
    };

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isValid) {
          handleSave();
        } else if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isValid, handleSave, onCancel]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Vytvořit záhon s rozměry</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Šířka (cm)</label>
                <input
                  type="text"
                  value={widthInput}
                  onChange={handleWidthChange}
                  placeholder="100"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    widthError 
                      ? 'border-red-500 bg-red-50' 
                      : !widthError && widthInput !== '' && parseFloat(widthInput) >= 10 && parseFloat(widthInput) <= 1000
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  widthError ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {widthError ? 'Rozměr musí být 10-1000 cm' : '10-1000 cm'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Výška (cm)</label>
                <input
                  type="text"
                  value={heightInput}
                  onChange={handleHeightChange}
                  placeholder="100"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    heightError 
                      ? 'border-red-500 bg-red-50' 
                      : !heightError && heightInput !== '' && parseFloat(heightInput) >= 10 && parseFloat(heightInput) <= 1000
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  heightError ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {heightError ? 'Rozměr musí být 10-1000 cm' : '10-1000 cm'}
                </p>
              </div>
            </div>
            
            <div className={`text-sm p-3 rounded border transition-colors ${
              isValid 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              <strong>Náhled:</strong> {widthInput || '0'}cm × {heightInput || '0'}cm
              {isValid && (
                <p className="text-xs mt-1 text-green-600">✓ Platné rozměry</p>
              )}
              {!isValid && (widthInput !== '' || heightInput !== '') && (
                <p className="text-xs mt-1">Rozměry musí být mezi 10-1000 cm</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                isValid 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Vytvořit (Enter)
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Zrušit (Esc)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Context menu component
  const ContextMenu = ({ x, y, bedId, plantId, onEdit, onCopy, onDelete, onSave, onClose }) => {
    const isPlant = plantId !== undefined;
    
    return (
      <div 
        className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1"
        style={{ left: x, top: y }}
      >
        {!isPlant ? (
          // Bed context menu
          <>
            <button
              onClick={() => { onEdit(); onClose(); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <span>✏️</span> Upravit
            </button>
            <button
              onClick={() => { onCopy(); onClose(); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <span>📋</span> Kopírovat
            </button>
            <button
              onClick={() => { onSave(); onClose(); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
            >
              <span>💾</span> Uložit
            </button>
            <button
              onClick={() => { onDelete(); onClose(); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
            >
              <span>🗑️</span> Smazat
            </button>
          </>
        ) : (
          // Plant context menu
          <>
            <button
              onClick={() => { onCopy(); onClose(); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <span>📋</span> Kopírovat
            </button>
            <button
              onClick={() => { onDelete(); onClose(); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
            >
              <span>🗑️</span> Smazat
            </button>
          </>
        )}
      </div>
    );
  };

  // Load plan dialog component
  const LoadPlanDialog = ({ onLoad, onCancel }) => {
    const [savedPlans, setSavedPlans] = useState([]);

    // Načíst plány při otevření dialogu
    useEffect(() => {
      setSavedPlans(getSavedPlans());
    }, []);

    // Funkce pro vykreslení miniatury plánu
    const renderPlanThumbnail = (plan) => {
      const thumbnailSize = 120;
      const scale = thumbnailSize / Math.max(plan.gardenSize.width * 100, plan.gardenSize.height * 100);
      
      return (
        <svg width={thumbnailSize} height={thumbnailSize} className="border border-gray-300 rounded bg-white">
          {/* Grid background */}
          <defs>
            <pattern id={`grid-${plan.id}`} width={10 * scale} height={10 * scale} patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth={0.5}/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${plan.id})`} />
          
          {/* Garden border */}
          <rect
            x={0}
            y={0}
            width={plan.gardenSize.width * 100 * scale}
            height={plan.gardenSize.height * 100 * scale}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={1}
          />
          
          {/* Beds */}
          {plan.beds.map((bed) => (
            <rect
              key={bed.id}
              x={bed.x * 100 * scale}
              y={bed.y * 100 * scale}
              width={bed.width * 100 * scale}
              height={bed.height * 100 * scale}
              fill="#22c55e"
              stroke="#16a34a"
              strokeWidth={1}
            />
          ))}
          
          {/* Plants */}
          {Object.entries(plan.bedPlants || {}).map(([bedId, plants]) => {
            const bed = plan.beds.find(b => b.id === parseInt(bedId));
            if (!bed) return null;
            
            return plants.map((plant) => {
              const plantX = (bed.x + plant.x * bed.width) * 100 * scale;
              const plantY = (bed.y + plant.y * bed.height) * 100 * scale;
              const plantSize = 3 * scale;
              
              return (
                <circle
                  key={plant.id}
                  cx={plantX}
                  cy={plantY}
                  r={plantSize}
                  fill="#dc2626"
                  stroke="#991b1b"
                  strokeWidth={0.5}
                />
              );
            });
          })}
        </svg>
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Načíst osevní plán</h3>
          
          {savedPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Zatím nemáte uložené plány</p>
              <p className="text-sm text-gray-400 mt-2">Nejprve uložte nějaký plán pomocí tlačítka "Uložit celý plán"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Miniatura plánu */}
                    <div className="flex-shrink-0">
                      {renderPlanThumbnail(plan)}
                    </div>
                    
                    {/* Informace o plánu */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Uloženo: {new Date(plan.savedAt).toLocaleDateString('cs-CZ')}
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        <span>Záhonů: {plan.beds.length}</span>
                        <span className="mx-2">•</span>
                        <span>Rostlin: {Object.values(plan.bedPlants || {}).flat().length}</span>
                        <span className="mx-2">•</span>
                        <span>Zahrada: {plan.gardenSize.width}×{plan.gardenSize.height}m</span>
                      </div>
                    </div>
                    
                    {/* Tlačítka */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onLoad(plan)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Načíst
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Opravdu chcete smazat plán "${plan.name}"?`)) {
                            deleteSavedPlan(plan.id);
                            // Aktualizovat seznam
                            setSavedPlans(getSavedPlans());
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Save plan dialog component
  const SavePlanDialog = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');

    const handleSave = () => {
      if (name.trim()) {
        onSave(name.trim());
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Uložit osevní plán</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Název plánu</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Např. Jarní zelenina 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Uloží se celý osevní plán včetně:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Všech záhonů ({beds.length})</li>
                <li>Všech rostlin ({Object.values(bedPlants).flat().length})</li>
                <li>Velikosti zahrady ({gardenSize.width}×{gardenSize.height}m)</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Uložit
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
            >
              Zrušit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit dialog component
  const EditDialog = ({ bed, onSave, onCancel, onDelete }) => {
    const [dimensions, setDimensions] = useState({
      x: bed.x,
      y: bed.y,
      width: bed.width,
      height: bed.height
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Upravit záhon</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">X (m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={gardenSize.width}
                  value={dimensions.x}
                  onChange={(e) => setDimensions(prev => ({ ...prev, x: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Y (m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={gardenSize.height}
                  value={dimensions.y}
                  onChange={(e) => setDimensions(prev => ({ ...prev, y: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Šířka (m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={gardenSize.width}
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Výška (m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={gardenSize.height}
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => onSave(bed.id, dimensions)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Uložit
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Zrušit
            </button>
            <button
              onClick={() => onDelete(bed.id)}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Smazat
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Garden size controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Šířka:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={gardenSize.width}
            onChange={(e) => setGardenSize(prev => ({ ...prev, width: Number(e.target.value) }))}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          />
          <span className="text-sm text-gray-600">m</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Výška:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={gardenSize.height}
            onChange={(e) => setGardenSize(prev => ({ ...prev, height: Number(e.target.value) }))}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          />
          <span className="text-sm text-gray-600">m</span>
        </div>
        
        <div className="text-sm text-gray-500">
          Velikost zahrádky: {gardenSize.width} × {gardenSize.height} m
        </div>
      </div>

      {/* Tools */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTool('select')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTool === 'select'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vybrat a přesunout
        </button>
        <button
          onClick={() => setSelectedTool('draw')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTool === 'draw'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Kreslit záhon
        </button>
        <button
          onClick={() => setShowManualInput(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          📏 Ruční rozměry
        </button>
        <button
          onClick={() => setShowSavePlanDialog(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          💾 Uložit celý plán
        </button>
        <button
          onClick={() => setShowLoadPlanDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          📂 Načíst plán
        </button>
        <button
          onClick={() => {
            if (beds.length > 0 || Object.keys(bedPlants).length > 0) {
              if (window.confirm('Opravdu chcete smazat celý osevní plán? Tato akce je nevratná.')) {
                setBeds([]);
                setBedPlants({});
                setSelectedBed(null);
                setEditingBed(null);
                setContextMenu({ show: false, x: 0, y: 0, bedId: null, plantId: null });
                alert('Osevní plán byl smazán.');
              }
            } else {
              alert('Žádný osevní plán k smazání.');
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          🗑️ Smazat celý plán
        </button>
        
        {/* Quick actions for selected bed */}
        {selectedBed && (
          <div className="flex gap-2 ml-4 pl-4 border-l border-gray-300">
            <button
              onClick={() => setEditingBed(selectedBed)}
              className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
            >
              ✏️ Upravit
            </button>
            <button
              onClick={() => copyBed(selectedBed.id)}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              📋 Kopírovat
            </button>
            <button
              onClick={() => saveBed(selectedBed.id)}
              className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
            >
              💾 Uložit
            </button>
            <button
              onClick={() => deleteBed(selectedBed.id)}
              className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              🗑️ Smazat
            </button>
          </div>
        )}
      </div>

      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white relative"
      >
        <svg
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="cursor-crosshair"
        >
          {/* Grid */}
          {renderGrid()}
          
          {/* Garden border */}
          <rect
            x={0}
            y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={2}
          />
          
          {/* Existing beds */}
          {renderBeds()}
          
          {/* Current bed being drawn */}
          {renderCurrentBed()}
          
          {/* Live dimensions during resize */}
          {renderLiveDimensions()}
        </svg>

        {/* Scale indicator */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
          1px = 1cm
        </div>

        {/* Garden dimensions */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
          {gardenSize.width} × {gardenSize.height} m
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Návod:</strong></p>
        <p>• <strong>Kreslit záhon:</strong> Klikněte a táhněte pro vytvoření obdélníkového záhonu (automaticky se vybere)</p>
        <p>• <strong>Ruční rozměry:</strong> Klikněte na "📏 Ruční rozměry" pro zadání přesných rozměrů v cm</p>
        <p>• <strong>Vybrat a přesunout:</strong> Klikněte na záhon a táhněte pro přesun</p>
        <p>• <strong>Zmenšit/zvětšit:</strong> Chytněte modré tečky v rozích vybraného záhonu</p>
        <p>• <strong>Hover akce:</strong> Najděte myší na záhon pro zobrazení tlačítek kopírovat/smazat</p>
        <p>• <strong>Uložit záhon:</strong> Pravé tlačítko myši → "Uložit" nebo tlačítko "💾 Uložit"</p>
        <p>• <strong>Klávesové zkratky:</strong> Ctrl+C pro kopírování, Delete pro smazání (vybraný záhon)</p>
        <p>• <strong>Editovat:</strong> Dvojklik na záhon nebo pravé tlačítko myši otevře možnosti</p>
        <p>• <strong>Rostliny:</strong> Přetáhněte rostlinu ze seznamu do vybraného záhonu</p>
        <p>• <strong>Přesouvání rostlin:</strong> Klikněte a táhněte rostlinu v záhonu pro přesun</p>
        <p>• <strong>Rostliny v záhonech:</strong> Pravé tlačítko myši na rostlině pro kopírování/smazání</p>
        <p>• <strong>Uložit celý plán:</strong> Klikněte na "💾 Uložit celý plán" pro uložení všech záhonů a rostlin</p>
        <p>• <strong>Načíst plán:</strong> Klikněte na "📂 Načíst plán" pro načtení dříve uloženého plánu</p>
        <p>• <strong>Měřítko:</strong> 1px = 1cm, mřížka zobrazuje každý metr (tlustší čáry) a každých 10cm (tenčí čáry)</p>
        <p>• Záhonů: {beds.length} | Uložených: {savedBeds.length}</p>
      </div>

      {/* Context menu */}
      {contextMenu.show && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          bedId={contextMenu.bedId}
          plantId={contextMenu.plantId}
          onEdit={() => {
            const bed = beds.find(b => b.id === contextMenu.bedId);
            if (bed) setEditingBed(bed);
          }}
          onCopy={() => {
            if (contextMenu.plantId) {
              copyPlantInBed(contextMenu.bedId, contextMenu.plantId);
            } else {
              copyBed(contextMenu.bedId);
            }
          }}
          onSave={() => saveBed(contextMenu.bedId)}
          onDelete={() => {
            if (contextMenu.plantId) {
              removePlantFromBed(contextMenu.bedId, contextMenu.plantId);
            } else {
              deleteBed(contextMenu.bedId);
            }
          }}
          onClose={() => setContextMenu({ show: false, x: 0, y: 0, bedId: null, plantId: null })}
        />
      )}

      {/* Manual input dialog */}
      {showManualInput && (
        <ManualInputDialog
          onSave={createManualBed}
          onCancel={() => setShowManualInput(false)}
        />
      )}

      {/* Save plan dialog */}
      {showSavePlanDialog && (
        <SavePlanDialog
          onSave={saveCompletePlan}
          onCancel={() => setShowSavePlanDialog(false)}
        />
      )}

      {/* Load plan dialog */}
      {showLoadPlanDialog && (
        <LoadPlanDialog
          onLoad={(plan) => {
            loadCompletePlan(plan);
            setShowLoadPlanDialog(false);
          }}
          onCancel={() => setShowLoadPlanDialog(false)}
        />
      )}

      {/* Edit dialog */}
      {editingBed && (
        <EditDialog
          bed={editingBed}
          onSave={updateBed}
          onCancel={() => setEditingBed(null)}
          onDelete={deleteBed}
        />
      )}
    </div>
  );
}
