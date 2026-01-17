document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elements ---
    const btnCalc = document.getElementById('calcBtn');
    const btnClear = document.getElementById('clearBtn');
    
    // Toggles
    const toggleAdv = document.getElementById('advToggle');
    const advSection = document.getElementById('advSection');
    const subBaseCheck = document.getElementById('subBaseCheck');
    const subBaseSection = document.getElementById('subBaseSection');

    // Inputs
    const lengthInput = document.getElementById('length');
    const widthInput = document.getElementById('width');
    const depthInput = document.getElementById('depth');
    const wasteInput = document.getElementById('waste');
    
    // Advanced Inputs
    const priceInput = document.getElementById('price');
    const laborInput = document.getElementById('laborPrice');
    const densityInput = document.getElementById('density');
    const compactionInput = document.getElementById('compaction');
    
    // Sub-Base Input
    const baseDepthInput = document.getElementById('baseDepth');
    const baseDensityInput = document.getElementById('baseDensity');

    // Units
    const lUnit = document.getElementById('lengthUnit');
    const wUnit = document.getElementById('widthUnit');
    const dUnit = document.getElementById('depthUnit');

    // Results
    const resultBox = document.getElementById('resultBox');
    const resTons = document.getElementById('resTons');
    const resBaseTons = document.getElementById('resBaseTons');
    const baseResultBox = document.getElementById('baseResultBox');
    const costResultBox = document.getElementById('costResultBox');
    const resTotalCost = document.getElementById('resTotalCost');
    const resArea = document.getElementById('resArea');
    const resVol = document.getElementById('resVol');

    // Chart Elements
    const costBarWrapper = document.getElementById('costBarWrapper');
    const barMaterial = document.getElementById('barMaterial');
    const barLabor = document.getElementById('barLabor');

    // --- Toggle Logic ---
    toggleAdv.addEventListener('click', () => {
        advSection.classList.toggle('show');
        toggleAdv.textContent = advSection.classList.contains('show') 
            ? "Hide Cost & Compaction Settings ▲" 
            : "Show Cost & Compaction Settings ▼";
    });

    subBaseCheck.addEventListener('change', () => {
        subBaseSection.classList.toggle('show', subBaseCheck.checked);
        if(!subBaseCheck.checked) {
            baseResultBox.style.display = 'none';
        }
    });

    // --- Calculation Logic ---
    btnCalc.addEventListener('click', () => {
        const L = parseFloat(lengthInput.value);
        const W = parseFloat(widthInput.value);
        const D = parseFloat(depthInput.value);
        
        if (!L || !W || !D) {
            alert("Please enter Length, Width, and Thickness.");
            return;
        }

        // 1. Normalize Dimensions to Feet
        let feetL = L;
        if (lUnit.value === 'm') feetL = L * 3.28084;
        if (lUnit.value === 'yd') feetL = L * 3;

        let feetW = W;
        if (wUnit.value === 'm') feetW = W * 3.28084;
        if (wUnit.value === 'yd') feetW = W * 3;

        let feetD = D;
        if (dUnit.value === 'in') feetD = D / 12;
        if (dUnit.value === 'cm') feetD = (D / 30.48);

        // 2. Core Math
        const areaSqFt = feetL * feetW;
        const volumeCuFt = areaSqFt * feetD;

        // 3. Asphalt Tonnage
        const density = parseFloat(densityInput.value) || 145; 
        const compaction = parseFloat(compactionInput.value) || 1.15;
        const waste = parseFloat(wasteInput.value) || 0.05;

        // Formula: Vol * Density * Compaction * Waste
        const rawLbs = volumeCuFt * density;
        const compactedLbs = rawLbs * compaction;
        const finalLbs = compactedLbs * (1 + waste);
        const finalTons = finalLbs / 2000;

        // 4. Sub-Base Tonnage
        let baseTons = 0;
        if (subBaseCheck.checked) {
            const baseD = parseFloat(baseDepthInput.value) || 0;
            const baseDens = parseFloat(baseDensityInput.value) || 110;
            const baseVol = areaSqFt * (baseD / 12);
            // Gravel usually doesn't shrink as much, simplified 10% safety
            baseTons = (baseVol * baseDens * 1.10) / 2000;
        }

        // 5. Cost Calculations
        const pricePerTon = parseFloat(priceInput.value) || 0;
        const laborRate = parseFloat(laborInput.value) || 0;
        
        // Estimate Base Cost at $35/ton if not specified, but we only calculate if user entered asphalt price
        // To keep it simple, we assume "Asphalt Price" input is strictly for asphalt material
        // If user wants base cost, they usually bundle it. 
        // We will calculate Material Cost (Asphalt) + Labor.
        
        let matCost = finalTons * pricePerTon;
        let laborCost = areaSqFt * laborRate;
        
        // Add estimated base cost ($30/ton avg) ONLY if price is entered, to make total realistic
        if (baseTons > 0 && pricePerTon > 0) {
            matCost += (baseTons * 30); 
        }

        const totalCost = matCost + laborCost;

        // 6. Display Results
        resTons.textContent = finalTons.toFixed(2);
        resArea.textContent = areaSqFt.toFixed(0);
        resVol.textContent = volumeCuFt.toFixed(1);

        // Sub Base
        if (subBaseCheck.checked && baseTons > 0) {
            baseResultBox.style.display = 'block';
            resBaseTons.textContent = baseTons.toFixed(2);
        } else {
            baseResultBox.style.display = 'none';
        }

        // Cost Section & Visualizer
        if (totalCost > 0) {
            costResultBox.style.display = 'block';
            resTotalCost.textContent = "$" + totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            // Visual Bar Logic (CSS Width)
            costBarWrapper.style.display = 'block';
            const total = matCost + laborCost;
            const matPercent = (matCost / total) * 100;
            const laborPercent = (laborCost / total) * 100;
            
            barMaterial.style.width = matPercent + "%";
            barLabor.style.width = laborPercent + "%";
        } else {
            costResultBox.style.display = 'none';
        }

        // Reveal
        resultBox.classList.add('visible');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // --- Reset Logic ---
    btnClear.addEventListener('click', () => {
        lengthInput.value = '';
        widthInput.value = '';
        depthInput.value = '';
        priceInput.value = '';
        laborInput.value = '';
        baseDepthInput.value = '';
        
        subBaseCheck.checked = false;
        subBaseSection.classList.remove('show');
        
        resultBox.classList.remove('visible');
        costResultBox.style.display = 'none';
        baseResultBox.style.display = 'none';
    });
});
