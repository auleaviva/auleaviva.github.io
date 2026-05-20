/* ============================================================
   AULEA VIVA — script.js
   Lógica completa: preloader, 3D hero, constelación cursor,
   chatbot, animaciones, ASCII art y formulario.
   ============================================================ */

// ============================================================
// 1. PRELOADER
// ============================================================
(function preloader() {
  const percentEl = document.getElementById('preloaderPercent');
  const asciiEl = document.getElementById('preloaderAscii');
  const preloaderEl = document.getElementById('preloader');

  const asciiLogo = `   ___   __ __ __   ____ ___      __ __ ____ __ __ ___
  / _ | / // // /  / __// _ |    / // // /  / // // _ |
 / __ |/ // // /__/ _/ / __ |   / // // /  / // // __ |
/_/ |_|\\___//____/___//_/ |_|   |___/ \\__/  \\___//_/ |_|`;

  let asciiChars = '';
  let i = 0;
  const typeAscii = setInterval(() => {
    if (i < asciiLogo.length) {
      asciiChars += asciiLogo[i];
      asciiEl.textContent = asciiChars;
      i++;
    } else {
      clearInterval(typeAscii);
    }
  }, 10);

  let percent = 0;
  const interval = setInterval(() => {
    percent += Math.random() * 8 + 2;
    if (percent >= 100) {
      percent = 100;
      clearInterval(interval);
      setTimeout(() => {
        preloaderEl.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }, 600);
    }
    percentEl.textContent = Math.floor(percent) + '%';
  }, 80);

  document.body.style.overflow = 'hidden';
})();

// ============================================================
// 2. CONSTELACIÓN DE PARTÍCULAS (cursor reactivo)
// ============================================================
(function particlesConstellation() {
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 90;
  const MAX_DISTANCE = 150;
  const MOUSE_DISTANCE = 200;

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nearMouse = dist < MOUSE_DISTANCE;

      ctx.beginPath();
      ctx.arc(this.x, this.y, nearMouse ? this.radius * 2 : this.radius, 0, Math.PI * 2);
      ctx.fillStyle = nearMouse ? 'rgba(127, 219, 218, 0.9)' : 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DISTANCE) {
          const opacity = (1 - dist / MAX_DISTANCE) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      // Conexión al mouse
      const dxM = particles[i].x - mouseX;
      const dyM = particles[i].y - mouseY;
      const distM = Math.sqrt(dxM * dxM + dyM * dyM);
      if (distM < MOUSE_DISTANCE) {
        const opacity = (1 - distM / MOUSE_DISTANCE) * 0.6;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(127, 219, 218, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connect();
    requestAnimationFrame(animate);
  }
  animate();
})();

// ============================================================
// 3. HERO 3D — Red Académica Viva (esfera de partículas)
// ============================================================
(function hero3D() {
  if (typeof THREE === 'undefined') return;

  const container = document.getElementById('hero3d');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Esfera de partículas
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);

  const PARTICLES = 700;
  const positions = new Float32Array(PARTICLES * 3);
  const radius = 14;

  for (let i = 0; i < PARTICLES; i++) {
    const phi = Math.acos(-1 + (2 * i) / PARTICLES);
    const theta = Math.sqrt(PARTICLES * Math.PI) * phi;
    positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  sphereGroup.add(points);

  // Líneas internas que conectan algunos puntos
  const linesGeometry = new THREE.BufferGeometry();
  const linePositions = [];
  for (let i = 0; i < PARTICLES; i += 8) {
    const target = Math.floor(Math.random() * PARTICLES);
    linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    linePositions.push(positions[target * 3], positions[target * 3 + 1], positions[target * 3 + 2]);
  }
  linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x7FDBDA,
    transparent: true,
    opacity: 0.15
  });
  const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
  sphereGroup.add(lines);

  // Glow central
  const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x7FDBDA,
    transparent: true,
    opacity: 0.08
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  sphereGroup.add(glow);

  // Posicionar la esfera a la derecha
  sphereGroup.position.x = 12;
  sphereGroup.position.y = -2;

  // Interactividad con el mouse
  let mouseInfluenceX = 0;
  let mouseInfluenceY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseInfluenceX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseInfluenceY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);
    sphereGroup.rotation.y += 0.0015;
    sphereGroup.rotation.x += 0.0008;
    sphereGroup.rotation.y += mouseInfluenceX * 0.01;
    sphereGroup.rotation.x += mouseInfluenceY * 0.01;
    glow.scale.x = 1 + Math.sin(Date.now() * 0.001) * 0.1;
    glow.scale.y = 1 + Math.sin(Date.now() * 0.001) * 0.1;
    glow.scale.z = 1 + Math.sin(Date.now() * 0.001) * 0.1;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    if (window.innerWidth < 900) {
      sphereGroup.position.x = 0;
    } else {
      sphereGroup.position.x = 12;
    }
  });

  if (window.innerWidth < 900) sphereGroup.position.x = 0;
})();

// ============================================================
// 4. NAVEGACIÓN CON SCROLL
// ============================================================
(function navigation() {
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const mobileBtn = document.getElementById('navMobileBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }
})();

// ============================================================
// 5. FADE-IN ON SCROLL
// ============================================================
(function fadeInOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

// ============================================================
// 6. ASCII ART DE FILOSOFÍA Y FOOTER
// ============================================================
(function asciiArt() {
  const filosofiaAscii = `
                  .::.
              .:::::::::.
           .::::'   .:::::.
         .:::'        .::::.
       .::'             '::::.
      ::'                 '::::.
     ::         _____         '::.
    ::       _-'     '-_       '::
    ::      /   .---.   \\       ::
    ::     |   |  |  |   |      ::
    ::     |   |__|__|   |      ::
    ::      \\_____|_____/       ::
    ::                          ::
     ::         A U L E A      ::
      ::        V  I  V  A    ::
       '::                  ::'
         '::.            .::'
           '::::.    .::::'
              '::::::::::'
                  '::'

  > calidad academica virtual
  > donde la norma se vuelve experiencia
  > 2026 . aulea_viva . co
  `;

  const footerAscii = `
+-----------------------------------------------------------+
|                                                           |
|       A U L E A   V I V A  -  CALIDAD ACADEMICA VIRTUAL   |
|                                                           |
|       > sistema_de_acompanamiento_academico               |
|       > version_2026.05 :: estable                        |
|       > status: en_linea                                  |
|                                                           |
+-----------------------------------------------------------+
  `;

  const filEl = document.getElementById('filosofiaAscii');
  const footEl = document.getElementById('footerAscii');
  if (filEl) filEl.textContent = filosofiaAscii;
  if (footEl) footEl.textContent = footerAscii;

  // Efecto vivo: parpadeos sutiles de partículas dentro del ASCII
  if (filEl) {
    const baseText = filosofiaAscii;
    // Caracteres "candidatos" para parpadear (puntos y dos puntos del contorno)
    const variants = [
      { from: '.', to: '·' },
      { from: ':', to: '∙' },
      { from: "'", to: '`' }
    ];

    setInterval(() => {
      let text = baseText;
      // Reemplazos aleatorios muy puntuales (1-3 caracteres cada vez)
      const swaps = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < swaps; i++) {
        const v = variants[Math.floor(Math.random() * variants.length)];
        // Buscar todas las posiciones del caracter
        const positions = [];
        for (let j = 0; j < text.length; j++) {
          if (text[j] === v.from) positions.push(j);
        }
        if (positions.length > 0) {
          const pos = positions[Math.floor(Math.random() * positions.length)];
          text = text.substring(0, pos) + v.to + text.substring(pos + 1);
        }
      }
      filEl.textContent = text;
    }, 200);
  }
})();

// ============================================================
// 7. CHATBOT INTELIGENTE
// ============================================================
(function chatbot() {
  const trigger = document.getElementById('chatbotTrigger');
  const windowEl = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const messagesEl = document.getElementById('chatbotMessages');
  const optionsEl = document.getElementById('chatbotOptions');
  const input = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSend');
  const notif = document.querySelector('.chatbot-notif');

  let conversationStarted = false;

  // Base de conocimiento
  const knowledge = {
    greeting: [
      "¡Hola! 👋 Soy el asistente virtual de Aulea Viva. Estoy aquí para resolver tus dudas sobre consultoría en calidad académica virtual. ¿En qué puedo ayudarte?",
    ],
    servicios: "Ofrecemos 6 líneas de servicio especializadas:\n\n• Formación y certificación de docentes virtuales\n• Acompañamiento a vicerrectorías\n• Diseño instruccional de cursos\n• Registro calificado y acreditación\n• Diplomados propios de docencia virtual\n• Asesoría tecnológica en LMS\n\n¿Sobre cuál te gustaría saber más?",
    formacion: "Nuestros programas de formación docente están diseñados para profesores universitarios que necesitan dominar la pedagogía virtual. Incluyen diplomado, talleres prácticos en LMS y certificación verificable. ¿Te gustaría que un asesor te contacte?",
    acompanamiento: "Trabajamos con vicerrectorías y direcciones de educación virtual mediante un retainer mensual estratégico. Incluye auditoría continua, métricas de calidad y reportes ejecutivos. Es ideal para universidades que quieren elevar su programa virtual.",
    diseno: "Diseñamos cursos virtuales completos: storyboards pedagógicos, UX educativo y producción de contenidos. Cumplimos con los estándares de calidad del MEN y modelos pedagógicos contemporáneos.",
    acreditacion: "Acompañamos a universidades en procesos de registro calificado (Decreto 1330 de 2019) y acreditación de alta calidad ante el CNA. Te ayudamos a cumplir todas las condiciones de calidad.",
    diplomados: "Tenemos diplomados propios de 'Docencia Virtual de Calidad' con cohortes nacionales 100% online, metodología activa y comunidad de práctica. Son programas certificados y reconocidos.",
    lms: "Configuramos, integramos y gobernamos plataformas LMS como Moodle, Canvas, Blackboard y Brightspace. Incluye dashboards de seguimiento e integraciones API personalizadas.",
    precio: "Cada proyecto es distinto y se cotiza según necesidades específicas de tu institución. Te invito a agendar una primera consultoría sin costo donde nuestro equipo te entregará una propuesta personalizada. ¿Te conectamos por WhatsApp?",
    contacto: "Puedes contactarnos por:\n📧 contacto@auleaviva.com\n💬 WhatsApp: +57 302 746 5713\n\nTe respondemos en menos de 24 horas. ¿Prefieres que te contacte un asesor ahora mismo?",
    whatsapp: "redirect_whatsapp",
    decreto: "El Decreto 1330 de 2019 establece las condiciones de calidad para programas académicos en Colombia, incluyendo educación virtual. Te acompañamos en el cumplimiento integral de todas sus exigencias para registro calificado.",
    universidad: "Trabajamos con universidades en toda Colombia, 100% online. Acompañamos vicerrectorías académicas, direcciones de educación virtual y decanaturas. ¿De qué institución nos contactas?",
    docente: "Si eres docente individual, te invitamos a nuestros diplomados y programas de formación con certificación. Ideal para profesores universitarios que se forman en virtualidad.",
    horario: "Atendemos 100% online a nivel nacional. Nuestro equipo responde en horario laboral colombiano (lunes a viernes 8am-6pm). Por WhatsApp respondemos en menos de 2 horas en ese horario.",
    default: "Excelente pregunta. Para darte una respuesta precisa y personalizada, te recomiendo conversar directamente con nuestro equipo por WhatsApp. ¿Te conecto ahora?"
  };

  const initialOptions = [
    "Ver servicios",
    "Precios",
    "Contactar asesor",
    "Sobre Decreto 1330"
  ];

  function addMessage(text, isBot = true, delay = 0) {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = isBot ? 'chat-msg chat-msg-bot' : 'chat-msg chat-msg-user';
      div.style.whiteSpace = 'pre-line';
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, delay);
  }

  function showTyping(callback, delay = 1000) {
    const typing = document.createElement('div');
    typing.className = 'chat-msg-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    setTimeout(() => {
      typing.remove();
      callback();
    }, delay);
  }

  function showOptions(opts) {
    optionsEl.innerHTML = '';
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleOption(opt));
      optionsEl.appendChild(btn);
    });
  }

  function clearOptions() {
    optionsEl.innerHTML = '';
  }

  function processInput(text) {
    const lower = text.toLowerCase();

    if (/hola|buenas|buen[oa]s? (d[ií]as|tardes|noches)|saludos/.test(lower)) {
      return knowledge.greeting[0];
    }
    if (/servicio|que hacen|ofrec|portafolio/.test(lower)) return knowledge.servicios;
    if (/formaci[oó]n|capacitaci[oó]n|docente|profesor.*forma/.test(lower)) return knowledge.formacion;
    if (/acompa[ñn]amiento|mensual|retainer|vicerrector/.test(lower)) return knowledge.acompanamiento;
    if (/dise[ñn]o instruccional|curso virtual|storyboard/.test(lower)) return knowledge.diseno;
    if (/acreditaci[oó]n|registro calificado|cna/.test(lower)) return knowledge.acreditacion;
    if (/diplomado|certificac/.test(lower)) return knowledge.diplomados;
    if (/lms|moodle|canvas|blackboard|plataforma/.test(lower)) return knowledge.lms;
    if (/precio|costo|tarifa|valor|cu[aá]nto|cobran|pagar/.test(lower)) return knowledge.precio;
    if (/whatsapp|asesor|hablar.*persona|alguien|llamar/.test(lower)) return knowledge.contacto;
    if (/decreto.*1330|1330|normativa|men/.test(lower)) return knowledge.decreto;
    if (/universidad|instituci[oó]n|vicerrector/.test(lower)) return knowledge.universidad;
    if (/soy docente|profesor|maestro/.test(lower)) return knowledge.docente;
    if (/horario|cuando.*atien|disponib/.test(lower)) return knowledge.horario;
    if (/contacto|correo|email|tel[eé]fono/.test(lower)) return knowledge.contacto;
    if (/gracias|chao|adi[oó]s|hasta luego/.test(lower)) {
      return "¡Gracias a ti! Recuerda que estamos disponibles por WhatsApp +57 302 746 5713 o al correo contacto@auleaviva.com. Que tengas un excelente día. 🎓";
    }

    return knowledge.default;
  }

  function handleOption(opt) {
    addMessage(opt, false);
    clearOptions();
    showTyping(() => {
      let response;
      switch (opt) {
        case "Ver servicios": response = knowledge.servicios; break;
        case "Precios": response = knowledge.precio; break;
        case "Contactar asesor": response = knowledge.contacto; break;
        case "Sobre Decreto 1330": response = knowledge.decreto; break;
        case "Sí, conéctame": case "Sí, contáctame":
          setTimeout(() => {
            window.open('https://wa.me/573027465713?text=Hola%20Aulea%20Viva%2C%20vengo%20del%20chatbot%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n', '_blank');
          }, 500);
          response = "¡Perfecto! Te estoy abriendo WhatsApp. Si no se abre automáticamente, escríbenos a +57 302 746 5713. 💬";
          break;
        case "Más servicios": response = knowledge.servicios; break;
        default: response = processInput(opt);
      }
      addMessage(response);
      setTimeout(() => {
        showOptions(["Más servicios", "Contactar asesor", "Sí, conéctame"]);
      }, 600);
    });
  }

  function handleUserInput() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, false);
    input.value = '';
    clearOptions();
    showTyping(() => {
      const response = processInput(text);
      addMessage(response);
      setTimeout(() => {
        showOptions(["Ver servicios", "Precios", "Sí, conéctame"]);
      }, 600);
    });
  }

  function startConversation() {
    if (conversationStarted) return;
    conversationStarted = true;
    notif.style.display = 'none';
    showTyping(() => {
      addMessage(knowledge.greeting[0]);
      setTimeout(() => showOptions(initialOptions), 500);
    }, 600);
  }

  trigger.addEventListener('click', () => {
    windowEl.classList.toggle('open');
    if (windowEl.classList.contains('open')) {
      startConversation();
      setTimeout(() => input.focus(), 400);
    }
  });

  closeBtn.addEventListener('click', () => windowEl.classList.remove('open'));

  sendBtn.addEventListener('click', handleUserInput);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  // Notificación automática después de 8 segundos
  setTimeout(() => {
    if (!conversationStarted) {
      notif.style.display = 'block';
    }
  }, 8000);
})();

// ============================================================
// 8. TILT 3D EN CARDS DE SERVICIOS
// ============================================================
(function tilt3D() {
  if (window.innerWidth <= 768) return; // No en móvil

  const cards = document.querySelectorAll('.servicio-card');

  cards.forEach(card => {
    let rafId = null;

    function handleMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calcular rotación (máximo 8 grados, sensación natural)
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      // Actualizar variables CSS para el glow
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
    }

    function handleLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = 'perspective(1500px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
  });
})();

// ============================================================
// 9. FORMULARIO DE CONTACTO
// ============================================================
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const nombre = form.nombre.value;
  const institucion = form.institucion.value;
  const email = form.email.value;
  const mensaje = form.mensaje.value;

  // Construir mensaje para WhatsApp/Email
  const whatsappMsg = encodeURIComponent(
    `Hola Aulea Viva, soy ${nombre} de ${institucion}.\n\nCorreo: ${email}\n\nConsulta:\n${mensaje}`
  );
  const mailtoLink = `mailto:contacto@auleaviva.com?subject=Consulta desde auleaviva.com - ${encodeURIComponent(institucion)}&body=${encodeURIComponent(
    `Nombre: ${nombre}\nInstitución: ${institucion}\nCorreo: ${email}\n\nMensaje:\n${mensaje}`
  )}`;

  // Mostrar opciones al usuario
  const confirmar = confirm(
    `¡Gracias ${nombre}! 🎓\n\nVamos a abrir tu cliente de correo para enviar el mensaje a contacto@auleaviva.com.\n\n¿Prefieres contactarnos por WhatsApp? Acepta para WhatsApp, cancela para email.`
  );

  if (confirmar) {
    window.open(`https://wa.me/573027465713?text=${whatsappMsg}`, '_blank');
  } else {
    window.location.href = mailtoLink;
  }

  form.reset();
}
