/* ============================================
   GAJATHURU INTERIORS — Custom Furniture Website
   JavaScript Functionality
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================
const BUSINESS_WHATSAPP = "94789720335"; // Replace with actual WhatsApp number

// ============================================
// DOM ELEMENTS
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Form elements
const customForm = document.getElementById('customForm');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// Preview elements
const previewFurniture = document.getElementById('previewFurniture');
const previewDimensions = document.getElementById('previewDimensions');
const pFurniture = document.getElementById('p-furniture');
const pSize = document.getElementById('p-size');
const pMaterial = document.getElementById('p-material');
const pColor = document.getElementById('p-color');
const pFeatures = document.getElementById('p-features');

// Upload elements
const uploadArea = document.getElementById('uploadArea');
const referenceImage = document.getElementById('referenceImage');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const uploadPreview = document.getElementById('uploadPreview');
const removeImageBtn = document.getElementById('removeImage');

// Custom color
const customColorRadio = document.getElementById('customColorRadio');
const customColorPicker = document.getElementById('customColorPicker');
const customColorInput = document.getElementById('customColorInput');
const customColorValue = document.getElementById('customColorValue');

// Features container
const featuresContainer = document.getElementById('featuresContainer');

// Summary elements
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');

// Current step tracker
let currentStep = 1;
const totalSteps = 7;

// Order data storage
let orderData = {
    furniture: '',
    furnitureIcon: 'fa-couch',
    width: '',
    height: '',
    depth: '',
    unit: 'ft',
    material: '',
    color: '',
    customColor: '',
    features: {},
    referenceImage: null,
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
};

// ============================================
// NAVIGATION
// ============================================

// Sticky navbar on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
});

// Update active nav link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================
// CATEGORY SELECTION
// ============================================

function selectCategory(category) {
    // Map category to furniture radio value
    const categoryMap = {
        'sofa': 'Sofa',
        'bed': 'Bed',
        'wardrobe': 'Wardrobe',
        'dining-table': 'Dining Table',
        'tv-cabinet': 'TV Cabinet',
        'office-table': 'Office Table',
        'kitchen-cabinet': 'Kitchen Cabinet',
        'custom': 'Custom Furniture'
    };

    const furnitureValue = categoryMap[category];
    if (!furnitureValue) return;

    // Find and check the radio button
    const radio = document.querySelector(`input[name="furniture"][value="${furnitureValue}"]`);
    if (radio) {
        radio.checked = true;
        updateOrderData('furniture', furnitureValue);
        updateOrderData('furnitureIcon', radio.dataset.icon || 'fa-couch');
        updatePreview();
        enableNextButton(1);
    }

    // Scroll to builder
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });

    // Reset to step 1
    goToStep(1);
}

// ============================================
// MULTI-STEP FORM WIZARD
// ============================================

// Initialize step navigation
document.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                goToStep(currentStep + 1);
            }
        }
    });
});

document.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });
});

function goToStep(step) {
    // Hide current step
    formSteps[currentStep - 1].classList.remove('active');

    // Show new step
    currentStep = step;
    formSteps[currentStep - 1].classList.add('active');

    // Update progress bar
    updateProgressBar();

    // Update preview
    updatePreview();

    // If on summary step, generate summary
    if (currentStep === 7) {
        generateSummary();
        generateWhatsAppLink();
    }

    // Scroll form panel to top
    document.querySelector('.form-panel').scrollTop = 0;
}

function updateProgressBar() {
    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });

    progressLines.forEach((line, index) => {
        line.classList.remove('completed');
        if (index + 1 < currentStep) {
            line.classList.add('completed');
        }
    });
}

function validateCurrentStep() {
    const stepEl = formSteps[currentStep - 1];
    const requiredInputs = stepEl.querySelectorAll('input[required], textarea[required]');
    let valid = true;

    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
            input.style.borderColor = '#e74c3c';

            // Show error message if exists
            const errorMsg = input.parentElement.querySelector('.error-msg');
            if (errorMsg) {
                errorMsg.style.display = 'block';
            }
        } else {
            input.style.borderColor = '';
            const errorMsg = input.parentElement.querySelector('.error-msg');
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
        }
    });

    // Step-specific validation
    if (currentStep === 1) {
        const selected = document.querySelector('input[name="furniture"]:checked');
        if (!selected) {
            valid = false;
            alert('Please select a furniture type.');
        }
    }

    if (currentStep === 3) {
        const selected = document.querySelector('input[name="material"]:checked');
        if (!selected) {
            valid = false;
            alert('Please select a material.');
        }
    }

    if (currentStep === 4) {
        const selected = document.querySelector('input[name="color"]:checked');
        if (!selected) {
            valid = false;
            alert('Please select a color.');
        }
    }

    if (currentStep === 6) {
        // Validate phone number format
        const phone = document.getElementById('phone');
        if (phone.value && !/^\+?[0-9\s\-]{7,15}$/.test(phone.value.replace(/\s/g, ''))) {
            valid = false;
            phone.style.borderColor = '#e74c3c';
            document.getElementById('phoneError').style.display = 'block';
        }
    }

    return valid;
}

function enableNextButton(step) {
    const stepEl = formSteps[step - 1];
    const nextBtn = stepEl.querySelector('.next-step');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

// ============================================
// FORM INPUT HANDLERS
// ============================================

// Furniture selection
document.querySelectorAll('input[name="furniture"]').forEach(radio => {
    radio.addEventListener('change', function() {
        updateOrderData('furniture', this.value);
        updateOrderData('furnitureIcon', this.dataset.icon || 'fa-couch');
        updatePreview();
        generateFeatures(this.value);
        enableNextButton(1);
    });
});

// Size inputs
['width', 'height', 'depth'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', function() {
            updateOrderData(id, this.value);
            updatePreview();
        });
    }
});

// Unit selection
document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', function() {
        updateOrderData('unit', this.value);
        updateUnitLabels(this.value);
        updatePreview();
    });
});

function updateUnitLabels(unit) {
    const labels = document.querySelectorAll('.unit-label');
    const unitText = unit === 'ft' ? 'ft' : unit === 'in' ? 'in' : 'cm';
    labels.forEach(label => {
        label.textContent = `(${unitText})`;
    });
}

// Material selection
document.querySelectorAll('input[name="material"]').forEach(radio => {
    radio.addEventListener('change', function() {
        updateOrderData('material', this.value);
        updatePreview();
        enableNextButton(3);
    });
});

// Color selection
document.querySelectorAll('input[name="color"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'custom') {
            customColorPicker.style.display = 'flex';
            updateOrderData('color', 'Custom');
            updateOrderData('customColor', customColorInput.value);
        } else {
            customColorPicker.style.display = 'none';
            updateOrderData('color', this.value);
            updateOrderData('customColor', '');
        }
        updatePreview();
        enableNextButton(4);
    });
});

// Custom color picker
customColorInput.addEventListener('input', function() {
    updateOrderData('customColor', this.value);
    customColorValue.textContent = this.value.toUpperCase();
    updatePreview();
});

// Customer details
document.getElementById('fullName').addEventListener('input', function() {
    updateOrderData('fullName', this.value);
});

document.getElementById('phone').addEventListener('input', function() {
    updateOrderData('phone', this.value);
});

document.getElementById('email').addEventListener('input', function() {
    updateOrderData('email', this.value);
});

document.getElementById('address').addEventListener('input', function() {
    updateOrderData('address', this.value);
});

document.getElementById('city').addEventListener('input', function() {
    updateOrderData('city', this.value);
});

document.getElementById('notes').addEventListener('input', function() {
    updateOrderData('notes', this.value);
});

function updateOrderData(key, value) {
    orderData[key] = value;
}

// ============================================
// DYNAMIC FEATURES GENERATION
// ============================================

const featureTemplates = {
    'Wardrobe': [
        {
            title: 'Number of Doors',
            icon: 'fa-door-open',
            name: 'doors',
            type: 'radio',
            options: ['1 Door', '2 Doors', '3 Doors', '4 Doors', '5+ Doors']
        },
        {
            title: 'Number of Drawers',
            icon: 'fa-archive',
            name: 'drawers',
            type: 'radio',
            options: ['No Drawers', '1 Drawer', '2 Drawers', '3 Drawers', '4+ Drawers']
        },
        {
            title: 'Number of Shelves',
            icon: 'fa-layer-group',
            name: 'shelves',
            type: 'radio',
            options: ['2 Shelves', '3 Shelves', '4 Shelves', '5 Shelves', '6+ Shelves']
        },
        {
            title: 'Additional Options',
            icon: 'fa-plus-circle',
            name: 'extras',
            type: 'checkbox',
            options: ['Mirror', 'Sliding Doors', 'Premium Handles', 'LED Lighting', 'Lock System']
        }
    ],
    'Sofa': [
        {
            title: 'Number of Seats',
            icon: 'fa-chair',
            name: 'seats',
            type: 'radio',
            options: ['1 Seater', '2 Seater', '3 Seater', '4 Seater', '5+ Seater', 'L-Shape']
        },
        {
            title: 'Fabric Type',
            icon: 'fa-tshirt',
            name: 'fabric',
            type: 'radio',
            options: ['Leather', 'Velvet', 'Linen', 'Cotton', 'Synthetic', 'Microfiber']
        },
        {
            title: 'Armrest Type',
            icon: 'fa-hands',
            name: 'armrest',
            type: 'radio',
            options: ['Standard', 'Wide', 'Curved', 'Square', 'No Armrest']
        },
        {
            title: 'Additional Options',
            icon: 'fa-plus-circle',
            name: 'extras',
            type: 'checkbox',
            options: ['Storage Under Seat', 'Recliner', 'Chaise Lounge', 'Cup Holders', 'USB Ports']
        }
    ],
    'Bed': [
        {
            title: 'Bed Size',
            icon: 'fa-bed',
            name: 'bedsize',
            type: 'radio',
            options: ['Single', 'Double', 'Queen', 'King', 'Super King']
        },
        {
            title: 'Headboard Design',
            icon: 'fa-couch',
            name: 'headboard',
            type: 'radio',
            options: ['Plain', 'Upholstered', 'Wooden Panel', 'Tufted', 'No Headboard']
        },
        {
            title: 'Storage Options',
            icon: 'fa-box',
            name: 'storage',
            type: 'radio',
            options: ['No Storage', 'Under-bed Drawers', 'Lift-up Storage', 'Side Drawers', 'Ottoman']
        },
        {
            title: 'Additional Options',
            icon: 'fa-plus-circle',
            name: 'extras',
            type: 'checkbox',
            options: ['Mattress Included', 'Bedside Tables', 'Reading Light', 'USB Charging', 'Under-bed LED']
        }
    ],
    'Dining Table': [
        {
            title: 'Seating Capacity',
            icon: 'fa-users',
            name: 'capacity',
            type: 'radio',
            options: ['2 Persons', '4 Persons', '6 Persons', '8 Persons', '10+ Persons']
        },
        {
            title: 'Table Shape',
            icon: 'fa-shapes',
            name: 'shape',
            type: 'radio',
            options: ['Rectangle', 'Round', 'Square', 'Oval', 'Extendable']
        },
        {
            title: 'Additional Options',
            icon: 'fa-plus-circle',
            name: 'extras',
            type: 'checkbox',
            options: ['Matching Chairs', 'Bench Seating', 'Glass Top', 'Marble Top', 'Storage Drawer']
        }
    ],
    'TV Cabinet': [
        {
            title: 'TV Size Compatibility',
            icon: 'fa-tv',
            name: 'tvsize',
            type: 'radio',
            options: ['Up to 32"', 'Up to 43"', 'Up to 55"', 'Up to 65"', 'Up to 75"+']
        },
        {
            title: 'Storage Type',
            icon: 'fa-boxes',
            name: 'storage',
            type: 'radio',
            options: ['Open Shelves', 'Closed Cabinets', 'Mixed', 'Floating', 'Console Style']
        },
        {
            title: 'Additional Options',
            icon: 'fa-plus-circle',
            name: 'extras',
            type: 'checkbox',
            options: ['Cable Management', 'LED Backlight', 'Wall Mount', 'Soundbar Shelf', 'Decorative Panels']
        }
    ],
    'Office Table': [
        {
            title: 'Table Type',
            icon: 'fa-briefcase',
            name: 'tabletype',
            type: 'radio',
            options: ['Executive Desk', 'Computer Desk', 'Standing Desk', 'Conference Table', 'Corner Desk']
        },
        {
            title: 'Drawer Configuration',
            icon: 'fa-archive',
            name: 'drawers',
            type: 'radio',
            options: ['No Drawers', '1 Drawer', '2 Drawers', '3 Drawers', 'Pedestal Drawers']
        },
        {
            title: 'Additional Options',
            icon: 'fa-plus-circle',
            name: 'extras',
            type: 'checkbox',
            options: ['Cable Grommet', 'Keyboard Tray', 'Monitor Stand', 'Bookshelf Attachment', 'Whiteboard']
        }
    ],
    'Kitchen Cabinet': [
        {
            title: 'Cabinet Type',
            icon: 'fa-utensils',
            name: 'cabinettype',
            type: 'radio',
            options: ['Base Cabinet', 'Wall Cabinet', 'Tall Cabinet', 'Island', 'Pantry']
        },
        {
            title: 'Door Style',
            icon: 'fa-door-closed',
            name: 'doorstyle',
            type: 'radio',
            options: ['Shaker', 'Flat Panel', 'Raised Panel', 'Glass Front', 'Slab']
        },
        {
            title: 'Additional Options',
            icon: 'fa-plus-circle',
            name: 'extras',
            type: 'checkbox',
            options: ['Soft-close Hinges', 'Pull-out Shelves', 'Spice Rack', 'Wine Rack', 'Waste Bin', 'Corner Solution']
        }
    ],
    'Custom Furniture': [
        {
            title: 'Describe Your Requirements',
            icon: 'fa-pencil-alt',
            name: 'description',
            type: 'textarea',
            placeholder: 'Please describe the type of custom furniture you need...'
        }
    ]
};

function generateFeatures(furnitureType) {
    const features = featureTemplates[furnitureType];

    if (!features) {
        featuresContainer.innerHTML = `
            <div class="feature-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>Select a furniture type to see available features.</p>
            </div>
        `;
        return;
    }

    let html = '';
    features.forEach(group => {
        html += `<div class="feature-group">`;
        html += `<h4><i class="fas ${group.icon}"></i> ${group.title}</h4>`;
        html += `<div class="feature-options">`;

        if (group.type === 'textarea') {
            html += `<textarea name="${group.name}" rows="4" placeholder="${group.placeholder}" 
                style="width:100%;padding:14px;border:2px solid var(--border);border-radius:var(--radius-md);font-family:inherit;resize:vertical;"></textarea>`;
        } else {
            group.options.forEach((option, idx) => {
                const inputId = `feat-${group.name}-${idx}`;
                html += `
                    <label class="feature-option">
                        <input type="${group.type}" name="${group.name}" value="${option}" id="${inputId}">
                        <span>${option}</span>
                    </label>
                `;
            });
        }

        html += `</div></div>`;
    });

    featuresContainer.innerHTML = html;

    // Add event listeners to new feature inputs
    featuresContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', collectFeatures);
    });

    featuresContainer.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', collectFeatures);
    });
}

function collectFeatures() {
    const features = {};
    const furnitureType = orderData.furniture;
    const template = featureTemplates[furnitureType];

    if (!template) return;

    template.forEach(group => {
        if (group.type === 'textarea') {
            const textarea = featuresContainer.querySelector(`textarea[name="${group.name}"]`);
            if (textarea && textarea.value.trim()) {
                features[group.name] = textarea.value.trim();
            }
        } else if (group.type === 'radio') {
            const selected = featuresContainer.querySelector(`input[name="${group.name}"]:checked`);
            if (selected) {
                features[group.name] = selected.value;
            }
        } else if (group.type === 'checkbox') {
            const checked = featuresContainer.querySelectorAll(`input[name="${group.name}"]:checked`);
            if (checked.length > 0) {
                features[group.name] = Array.from(checked).map(cb => cb.value);
            }
        }
    });

    updateOrderData('features', features);
    updatePreview();
}

// ============================================
// PREVIEW UPDATES
// ============================================

function updatePreview() {
    // Update furniture icon
    if (orderData.furniture) {
        previewFurniture.innerHTML = `<i class="fas ${orderData.furnitureIcon}"></i>`;
        pFurniture.textContent = orderData.furniture;
    }

    // Update dimensions
    const unit = orderData.unit;
    const w = orderData.width || '--';
    const h = orderData.height || '--';
    const d = orderData.depth || '--';

    previewDimensions.querySelector('.dim-width').textContent = `W: ${w}${w !== '--' ? unit : ''}`;
    previewDimensions.querySelector('.dim-height').textContent = `H: ${h}${h !== '--' ? unit : ''}`;
    previewDimensions.querySelector('.dim-depth').textContent = `D: ${d}${d !== '--' ? unit : ''}`;

    if (orderData.width || orderData.height || orderData.depth) {
        pSize.textContent = `${w}${w !== '--' ? unit : ''} × ${h}${h !== '--' ? unit : ''} × ${d}${d !== '--' ? unit : ''}`;
    } else {
        pSize.textContent = '--';
    }

    // Update material
    pMaterial.textContent = orderData.material || '--';

    // Update color
    let colorText = orderData.color || '--';
    if (orderData.color === 'Custom' && orderData.customColor) {
        colorText = `Custom (${orderData.customColor})`;
    }
    pColor.textContent = colorText;

    // Update features
    const features = orderData.features;
    let featureText = '--';
    if (features && Object.keys(features).length > 0) {
        const featureItems = [];
        Object.entries(features).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                featureItems.push(...value);
            } else {
                featureItems.push(value);
            }
        });
        featureText = featureItems.join(', ');
        if (featureText.length > 50) {
            featureText = featureText.substring(0, 50) + '...';
        }
    }
    pFeatures.textContent = featureText;
}

// ============================================
// IMAGE UPLOAD
// ============================================

uploadArea.addEventListener('click', () => {
    referenceImage.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent)';
    uploadArea.style.background = 'var(--accent-light)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageUpload(files[0]);
    }
});

referenceImage.addEventListener('change', function() {
    if (this.files.length > 0) {
        handleImageUpload(this.files[0]);
    }
});

function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        orderData.referenceImage = e.target.result;
        uploadPlaceholder.style.display = 'none';
        uploadPreview.src = e.target.result;
        uploadPreview.style.display = 'block';
        removeImageBtn.style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
}

removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    orderData.referenceImage = null;
    referenceImage.value = '';
    uploadPreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    removeImageBtn.style.display = 'none';
});

// ============================================
// ORDER SUMMARY
// ============================================

function generateSummary() {
    // Furniture
    document.getElementById('sum-furniture').textContent = orderData.furniture || 'Not selected';

    // Size
    const unit = orderData.unit;
    const sizeHtml = `
        <span>Width: ${orderData.width || '--'} ${orderData.width ? unit : ''}</span>
        <span>Height: ${orderData.height || '--'} ${orderData.height ? unit : ''}</span>
        <span>Depth: ${orderData.depth || '--'} ${orderData.depth ? unit : ''}</span>
    `;
    document.getElementById('sum-size').innerHTML = sizeHtml;

    // Design
    let colorDisplay = orderData.color || '--';
    if (orderData.color === 'Custom' && orderData.customColor) {
        colorDisplay = `Custom (${orderData.customColor})`;
    }
    const designHtml = `
        <span>Material: ${orderData.material || '--'}</span>
        <span>Color: ${colorDisplay}</span>
    `;
    document.getElementById('sum-design').innerHTML = designHtml;

    // Features
    const featuresContainer = document.getElementById('sum-features');
    featuresContainer.innerHTML = '';
    if (orderData.features && Object.keys(orderData.features).length > 0) {
        Object.entries(orderData.features).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    featuresContainer.innerHTML += `<span>${v}</span>`;
                });
            } else {
                featuresContainer.innerHTML += `<span>${value}</span>`;
            }
        });
    }

    // Reference Image
    const refSection = document.getElementById('sum-reference-section');
    if (orderData.referenceImage) {
        refSection.style.display = 'block';
        document.getElementById('sum-reference-img').src = orderData.referenceImage;
    } else {
        refSection.style.display = 'none';
    }

    // Customer
    const customerHtml = `
        <span>Name: ${orderData.fullName || '--'}</span>
        <span>Phone: ${orderData.phone || '--'}</span>
        <span>Email: ${orderData.email || '--'}</span>
        <span>Address: ${orderData.address ? orderData.address + ', ' + orderData.city : '--'}</span>
    `;
    document.getElementById('sum-customer').innerHTML = customerHtml;

    // Notes
    const notesSection = document.getElementById('sum-notes-section');
    if (orderData.notes) {
        notesSection.style.display = 'block';
        document.getElementById('sum-notes').textContent = orderData.notes;
    } else {
        notesSection.style.display = 'none';
    }
}

// ============================================
// WHATSAPP INTEGRATION
// ============================================

function generateWhatsAppLink() {
    const message = buildWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodedMessage}`;

    sendWhatsAppBtn.href = whatsappUrl;
}

function buildWhatsAppMessage() {
    const unit = orderData.unit;
    let colorDisplay = orderData.color || 'Not selected';
    if (orderData.color === 'Custom' && orderData.customColor) {
        colorDisplay = `Custom (${orderData.customColor})`;
    }

    // Build features text
    let featuresText = '';
    if (orderData.features && Object.keys(orderData.features).length > 0) {
        Object.entries(orderData.features).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    featuresText += `• ${v}\n`;
                });
            } else {
                featuresText += `• ${value}\n`;
            }
        });
    } else {
        featuresText = 'None specified';
    }

    const message = `🪑 *NEW CUSTOM FURNITURE ORDER*

*Furniture Item:* ${orderData.furniture || 'Not selected'}

📏 *SIZE DETAILS*
Width: ${orderData.width || '--'} ${orderData.width ? unit : ''}
Height: ${orderData.height || '--'} ${orderData.height ? unit : ''}
Depth: ${orderData.depth || '--'} ${orderData.depth ? unit : ''}

🎨 *DESIGN DETAILS*
Material: ${orderData.material || 'Not selected'}
Color: ${colorDisplay}

🔧 *FEATURES*
${featuresText}

${orderData.referenceImage ? '📷 *Reference Image:*\nCustomer has uploaded a reference design.\n' : ''}

👤 *CUSTOMER DETAILS*
Name: ${orderData.fullName || '--'}
Phone: ${orderData.phone || '--'}
Email: ${orderData.email || 'Not provided'}
Address: ${orderData.address ? orderData.address + ', ' + orderData.city : '--'}

📝 *ADDITIONAL REQUIREMENTS*
${orderData.notes || 'Please contact me with a quotation.'}

Thank you,\nGAJATHURU INTERIORS`;

    return message;
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe category cards
document.querySelectorAll('.category-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Observe about features
document.querySelectorAll('.about-feature').forEach(feature => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateX(-20px)';
    feature.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(feature);
});

// Observe contact cards
document.querySelectorAll('.contact-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// ============================================
// INPUT VALIDATION STYLING
// ============================================

document.querySelectorAll('input[required], textarea[required]').forEach(input => {
    input.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '';
        }
    });

    input.addEventListener('input', function() {
        if (this.value.trim()) {
            this.style.borderColor = '';
            const errorMsg = this.parentElement.querySelector('.error-msg');
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
        }
    });
});

// ============================================
// FLOATING WHATSAPP BUTTON VISIBILITY
// ============================================

const floatingWhatsApp = document.querySelector('.floating-whatsapp');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Hide floating button when near footer
    const footer = document.querySelector('.footer');
    const footerTop = footer.offsetTop;

    if (currentScrollY + window.innerHeight > footerTop - 100) {
        floatingWhatsApp.style.opacity = '0';
        floatingWhatsApp.style.pointerEvents = 'none';
    } else {
        floatingWhatsApp.style.opacity = '1';
        floatingWhatsApp.style.pointerEvents = 'auto';
    }

    lastScrollY = currentScrollY;
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set initial state
    updateProgressBar();
    updatePreview();

    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    console.log('GAJATHURU INTERIORS — Website loaded successfully');
});
