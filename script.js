"use strict";


const vehicleBrochures = [
  {
    id: "bmw-3",
    label: "BMW 3",
    title: "BMW 3 – SỰ THỎA MÃN PHÍA SAU TAY LÁI"
  },
  {
    id: "bmw-4-grand-coupe",
    label: "BMW 4 Grand Coupé",
    title: "BMW 4 GRAND COUPÉ – CHINH PHỤC TRONG MỘT KHOẢNH KHẮC"
  },
  {
    id: "bmw-4-convertible",
    label: "BMW 4 Convertible",
    title: "BMW 4 CONVERTIBLE – MỞ MUI - MỞ CẢM XÚC"
  },
  {
    id: "bmw-5",
    label: "BMW 5",
    title: "BMW 5 – DẤU ẤN CỦA SỰ THÀNH CÔNG"
  },
  {
    id: "bmw-7",
    label: "BMW 7",
    title: "BMW 7 – TUYỆT TÁC HOÀN HẢO"
  },
  {
    id: "the-new-bmw-7",
    label: "The New BMW 7",
    title: "THE NEW BMW 7 – DẤU ẤN NGƯỜI DẪN ĐẦU"
  },
  {
    id: "bmw-x1",
    label: "The New BMW X1",
    title: "THE NEW BMW X1 – LÁI ĐAM MÊ - NHẬP HỘI BMW"
  },
  {
    id: "bmw-x3",
    label: "BMW X3 All New 2026",
    title: "BMW X3 – KHỞI ĐẦU HÀNH TRÌNH KHÁC BIỆT"
  },
  {
    id: "bmw-x4",
    label: "BMW X4",
    title: "BMW X4 – TỎA SÁNG CHẤT RIÊNG"
  },
  {
    id: "bmw-x5",
    label: "BMW X5",
    title: "BMW X5 – THỂ THAO VÀ THANH LỊCH"
  },
  {
    id: "bmw-x6",
    label: "BMW X6",
    title: "BMW X6 – MÃNH THÚ ĐẦU ĐÀN"
  },
  {
    id: "bmw-x7",
    label: "BMW X7",
    title: "BMW X7 – BIỂU TƯỢNG UY QUYỀN"
  },
  {
    id: "bmw-z4",
    label: "BMW Z4",
    title: "BMW Z4 – TUYÊN NGÔN CỦA SỰ TỰ DO"
  },
  {
    id: "bmw-i4",
    label: "BMW i4",
    title: "BMW i4 – THUẦN ĐIỆN GIÀU CẢM XÚC"
  },
  {
    id: "bmw-ix3",
    label: "BMW iX3",
    title: "BMW iX3 – DÒNG CHẢY CỦA THỜI ĐẠI MỚI"
  },
  {
    id: "bmw-m2",
    label: "BMW M2 Coupé",
    title: "BMW M2 – CHẤT M DÀNH CHO MỌI ĐAM MÊ CẦM LÁI"
  },
  {
    id: "bmw-m3",
    label: "BMW M3 Competition M xDrive",
    title: "BMW M3 – BIỂU TƯỢNG QUA NHIỀU THẾ HỆ"
  },
  {
    id: "bmw-m3-touring",
    label: "BMW M3 Competition M xDrive Touring",
    title: "BMW M3 TOURING – KHÁC BIỆT KHÔNG CẦN CHỨNG MINH"
  },
  {
    id: "bmw-m4",
    label: "BMW M4 Competition M xDrive Coupé",
    title: "BMW M4 – CẢM GIÁC LÁI THUẦN CHẤT"
  }
];

const accessoryBrochures = [
  {
    id: "bmw-m2-m-performance-parts",
    label: "BMW M2 – Phụ kiện M Performance Parts",
    title: "BMW M2 – M PERFORMANCE PARTS"
  },
];


const PDFJS_VERSION = "6.5.438";
const PDFJS_LOCAL_BASE = new URL(`./vendor/pdfjs/${PDFJS_VERSION}/`, import.meta.url);
const PDFJS_MODULE_URL = new URL("pdf.min.mjs", PDFJS_LOCAL_BASE).href;
const PDFJS_WORKER_URL = new URL("pdf.worker.min.mjs", PDFJS_LOCAL_BASE).href;
const pdfjsAssetUrl = folder => new URL(`${folder}/`, PDFJS_LOCAL_BASE).href;

const brochureGroups = [
  { id: "models", heading: "CÁC MẪU XE BMW", items: vehicleBrochures },
  { id: "accessories", heading: "PHỤ TÙNG & PHỤ KIỆN", items: accessoryBrochures }
];
const brochures = brochureGroups.flatMap(group => group.items);
const $ = id => document.getElementById(id);
const title = $("brochureTitle");
const loading = $("loading");
const loadingText = $("loadingText");
const retryButton = $("retryButton");
const menuToggle = $("menuToggle");
const menu = $("brochureMenu");
const menuList = $("brochureList");
const backdrop = $("menuBackdrop");
const openPdf = $("openPdf");
const downloadPdf = $("downloadPdf");
const pdfScroll = $("pdfScroll");
const nativeViewer = $("nativeViewer");
const viewerNav = $("viewerNav");
const viewerZoom = $("viewerZoom");
const viewerTest = $("viewerTest");
const testNative = $("testNative");
const testPdfjs = $("testPdfjs");

const testParam = new URLSearchParams(location.search).get("test");
const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const TEST_MODE = testParam === "1" || (isLocalhost && testParam !== "0");
viewerTest.hidden = !TEST_MODE;
let forcedMode = null;
let activeViewerMode = null;
function supportsNativeEmbed() {
  return navigator.pdfViewerEnabled === true;
}
function setViewerMode(mode) {
  activeViewerMode = mode;
  document.documentElement.dataset.viewerMode = mode;
  const native = mode === "native";
  nativeViewer.hidden = !native;
  pdfScroll.hidden = native;
  viewerNav.hidden = native;
  viewerZoom.hidden = native;
  testNative.setAttribute("aria-pressed", String(native));
  testPdfjs.setAttribute("aria-pressed", String(!native));
}
const pdfPages = $("pdfPages");
const prevPage = $("prevPage");
const nextPage = $("nextPage");
const pageCounter = $("pageCounter");
const zoomOut = $("zoomOut");
const zoomIn = $("zoomIn");
const fitWidth = $("fitWidth");

let currentBrochureId = null;
let pdfLibraryPromise = null;
let loadingTask = null;
let pdfDoc = null;
let documentVersion = 0;
let renderGeneration = 0;
let zoom = 1;
let currentPage = 1;
let pageNodes = [];
let pageDimensions = new Map();
let renderedPages = new Set();
let pendingPages = [];
let queuedPages = new Set();
let inFlightPages = new Set();
let activeRenderTasks = new Map();
let activeRenders = 0;
let pageObserver = null;
let scrollScheduled = false;
let resizeScheduled = false;
const MOBILE = matchMedia("(max-width: 680px), (pointer: coarse)");
const MAX_PARALLEL_RENDERS = MOBILE.matches ? 1 : 2;
let firstPageReady = false;
let loadStarted = 0;
let lastViewerWidth = pdfScroll.clientWidth;
const debugPerformance = new URLSearchParams(location.search).get("debug") === "1";
function logPerformance(stage) {
  if (debugPerformance) console.info(`[BMW PDF] ${stage}: ${Math.round(performance.now() - loadStarted)} ms`);
}
function releaseCanvas(node) {
  const canvas = node?.querySelector("canvas");
  if (canvas) { canvas.width = 0; canvas.height = 0; canvas.remove(); }
}

function getPdfUrl(brochure) {
  const path = brochure.pdfPath || `./pdf/${brochure.id}.pdf`;
  try {
    const url = new URL(path, document.baseURI);
    if (url.origin !== location.origin || !url.pathname.toLowerCase().endsWith(".pdf")) {
      throw new Error("PDF phải nằm cùng website và có đuôi .pdf");
    }
    return url.href;
  } catch (error) {
    console.error("Đường dẫn PDF không hợp lệ:", path, error);
    return null;
  }
}

function getBrochureFromUrl() {
  const id = new URLSearchParams(location.search).get("brochure");
  return brochures.find(item => item.id === id) || brochures[0] || null;
}
function getBrochureHref(id) {
  const url = new URL(location.href);
  url.searchParams.set("brochure", id);
  return url.pathname + url.search + url.hash;
}
function updateBrochureUrl(id) {
  const url = new URL(location.href);
  if (url.searchParams.get("brochure") !== id) {
    url.searchParams.set("brochure", id);
    history.pushState({ brochure: id }, "", url);
  }
}
function updateActiveMenuItem(id) {
  menuList.querySelectorAll(".menu-item").forEach(link => {
    const active = link.dataset.brochureId === id;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
function showMessage(message, canRetry = false) {
  if (canRetry && !TEST_MODE) {
    loadingText.textContent = "";
    loading.classList.add("hidden");
    loading.classList.remove("is-error");
    retryButton.hidden = true;
    return;
  }
  loadingText.textContent = message;
  loading.classList.remove("hidden");
  loading.classList.toggle("is-error", canRetry);
  retryButton.hidden = !canRetry;
}
function hideMessage() { loading.classList.add("hidden"); }
function setPdfActions(pdfUrl) {
  const enabled = Boolean(pdfUrl);
  for (const link of [openPdf, downloadPdf]) {
    link.classList.toggle("is-disabled", !enabled);
    link.setAttribute("aria-disabled", String(!enabled));
    if (enabled) link.href = pdfUrl;
    else link.removeAttribute("href");
  }
  if (enabled) downloadPdf.download = decodeURIComponent(new URL(pdfUrl).pathname.split("/").pop());
  else downloadPdf.removeAttribute("download");
}
function updateControls() {
  const ready = Boolean(pdfDoc && firstPageReady);
  const total = ready ? pdfDoc.numPages : 0;
  pageCounter.textContent = ready ? `${currentPage} / ${total}` : "0 / 0";
  prevPage.disabled = !ready || currentPage <= 1;
  nextPage.disabled = !ready || currentPage >= total;
  zoomOut.disabled = !ready || zoom <= 0.75;
  zoomIn.disabled = !ready || zoom >= 2.5;
  fitWidth.disabled = !ready;
  fitWidth.textContent = `${Math.round(zoom * 100)}%`;
  fitWidth.title = "Nhấn để về mức vừa chiều ngang (100%)";
}
function pageBaseWidth() {
  return Math.max(140, Math.min(1100, pdfScroll.clientWidth - 24));
}
function setPageSize(number, node) {
  const fallback = pageDimensions.get(1) || { width: 612, height: 792 };
  const dimensions = pageDimensions.get(number) || fallback;
  const width = Math.round(pageBaseWidth() * zoom);
  node.style.width = `${width}px`;
  node.style.height = `${Math.round(width * dimensions.height / dimensions.width)}px`;
}

function resetDocument() {
  firstPageReady = false;
  renderGeneration++;
  if (pageObserver) { pageObserver.disconnect(); pageObserver = null; }
  for (const task of activeRenderTasks.values()) task.cancel();
  activeRenderTasks.clear();
  pendingPages = [];
  queuedPages.clear();
  inFlightPages.clear();
  renderedPages.clear();
  activeRenders = 0;
  pageNodes = [];
  pageDimensions.clear();
  pdfPages.querySelectorAll("canvas").forEach(canvas => { canvas.width = 0; canvas.height = 0; });
  pdfPages.replaceChildren();
  pdfScroll.scrollTop = 0;
  if (loadingTask) {
    const task = loadingTask;
    loadingTask = null;
    task.destroy().catch(() => {});
  } else if (pdfDoc) {
    pdfDoc.destroy().catch(() => {});
  }
  pdfDoc = null;
  currentPage = 1;
  zoom = 1;
  updateControls();
}

async function getPdfLibrary() {
  if (!pdfLibraryPromise) {
    pdfLibraryPromise = import(PDFJS_MODULE_URL).then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return pdfjs;
    }).catch(error => {
      pdfLibraryPromise = null;
      throw new Error("Không tải được thư viện PDF.js nội bộ (vendor/pdfjs). Hãy triển khai bản build có thư viện PDF.js.", { cause: error });
    });
  }
  return pdfLibraryPromise;
}

function makePageNodes(pdf) {
  const fragment = document.createDocumentFragment();
  for (let number = 1; number <= pdf.numPages; number++) {
    const node = document.createElement("section");
    node.className = "pdf-page";
    node.dataset.page = String(number);
    node.setAttribute("aria-label", `Trang ${number}`);
    const placeholder = document.createElement("span");
    placeholder.className = "page-placeholder";
    placeholder.textContent = `Trang ${number}`;
    node.appendChild(placeholder);
    setPageSize(number, node);
    pageNodes.push(node);
    fragment.appendChild(node);
  }
  pdfPages.appendChild(fragment);
}

async function renderPage(number, docVersion, generation, fastFirst = false, existingPage = null) {
  if (docVersion !== documentVersion || generation !== renderGeneration || !pdfDoc) return;
  const doc = pdfDoc;
  const node = pageNodes[number - 1];
  if (!node) return;
  let renderTask = null;
  try {
    const page = existingPage || await doc.getPage(number);
    if (docVersion !== documentVersion || generation !== renderGeneration) return;
    const rawViewport = page.getViewport({ scale: 1 });
    pageDimensions.set(number, { width: rawViewport.width, height: rawViewport.height });
    setPageSize(number, node);
    const cssWidth = node.clientWidth;
    const scale = cssWidth / rawViewport.width;
    const viewport = page.getViewport({ scale });
    const ratioCap = fastFirst ? 1.25 : zoom > 1 ? 2 : 1.5;
    const pixelBudget = fastFirst ? 3000000 : MOBILE.matches ? 4000000 : 6000000;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, ratioCap, Math.sqrt(pixelBudget / (viewport.width * viewport.height)));
    const canvas = document.createElement("canvas");
    canvas.className = "pdf-canvas";
    canvas.width = Math.max(1, Math.floor(viewport.width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(viewport.height * pixelRatio));
    canvas.style.width = `${Math.round(viewport.width)}px`;
    canvas.style.height = `${Math.round(viewport.height)}px`;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Trình duyệt không thể tạo canvas");
    releaseCanvas(node);
    node.appendChild(canvas);
    renderTask = page.render({
      canvas, canvasContext: context, viewport,
      transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : null
    });
    activeRenderTasks.set(number, renderTask);
    await renderTask.promise;
    if (docVersion !== documentVersion || generation !== renderGeneration) return;
    node.classList.add("is-rendered");
    renderedPages.add(number);
  } catch (error) {
    if (docVersion !== documentVersion || generation !== renderGeneration || error?.name === "RenderingCancelledException") return;
    console.error(`Không thể hiển thị trang ${number}:`, error);
    releaseCanvas(node);
    const info = node.querySelector(".page-placeholder");
    if (info) info.textContent = TEST_MODE ? `Không thể hiển thị trang ${number}` : "";
  } finally {
    if (renderTask && activeRenderTasks.get(number) === renderTask) activeRenderTasks.delete(number);
  }
}

function queuePage(number) {
  if (!pdfDoc || !firstPageReady || number < 1 || number > pdfDoc.numPages || renderedPages.has(number) || queuedPages.has(number) || inFlightPages.has(number) || activeRenderTasks.has(number)) return;
  pendingPages.push(number);
  queuedPages.add(number);
  pumpQueue();
}
function pumpQueue() {
  if (!pdfDoc || !firstPageReady) return;
  const generation = renderGeneration;
  const version = documentVersion;
  while (activeRenders < MAX_PARALLEL_RENDERS && pendingPages.length) {
    pendingPages.sort((a, b) => Math.abs(a - currentPage) - Math.abs(b - currentPage));
    const number = pendingPages.shift();
    queuedPages.delete(number);
    if (renderedPages.has(number) || inFlightPages.has(number)) continue;
    inFlightPages.add(number);
    activeRenders++;
    renderPage(number, version, generation).finally(() => {
      if (generation !== renderGeneration || version !== documentVersion) return;
      inFlightPages.delete(number);
      activeRenders--;
      pumpQueue();
    });
  }
}

function requestNearbyPages(number) {
  for (const n of [number, number + 1, number - 1]) queuePage(n);
}
function updatePageByScroll() {
  if (!pdfDoc || !firstPageReady || !pageNodes.length) return;
  const center = pdfScroll.scrollTop + pdfScroll.clientHeight * 0.38;
  let closestPage = 1;
  let smallestDistance = Infinity;
  pageNodes.forEach((node, index) => {
    const start = node.offsetTop;
    const end = start + node.offsetHeight;
    const distance = center < start ? start - center : center > end ? center - end : 0;
    if (distance < smallestDistance) { smallestDistance = distance; closestPage = index + 1; }
  });
  currentPage = closestPage;
  updateControls();
  const viewTop = pdfScroll.scrollTop, viewBottom = viewTop + pdfScroll.clientHeight;
  const isNear = n => {
    const node = pageNodes[n - 1];
    return node && (Math.abs(n - currentPage) <= 2 ||
      (node.offsetTop + node.offsetHeight >= viewTop - 200 && node.offsetTop <= viewBottom + 300));
  };
  pendingPages = pendingPages.filter(n => {
    if (isNear(n)) return true;
    queuedPages.delete(n); return false;
  });
  requestNearbyPages(currentPage);
  for (const n of renderedPages) {
    if (Math.abs(n - currentPage) > 3 && !isNear(n)) {
      releaseCanvas(pageNodes[n - 1]);
      pageNodes[n - 1]?.classList.remove("is-rendered");
      renderedPages.delete(n);
    }
  }
}
function activateObserver() {
  if (pageObserver) pageObserver.disconnect();
  pageObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) queuePage(Number(entry.target.dataset.page));
    }
  }, { root: pdfScroll, rootMargin: "180px 0px 300px 0px", threshold: 0 });
  for (const node of pageNodes) pageObserver.observe(node);
}

function loadNativePdf(pdfUrl, brochure, version) {
  const frame = document.createElement("iframe");
  frame.className = "native-pdf-frame";
  frame.title = `${brochure.label} E-Brochure`;
  const isCurrent = () => version === documentVersion && activeViewerMode === "native";
  const fallback = () => {
    if (!isCurrent()) return;
    if (TEST_MODE && forcedMode === "native") {
      showMessage("Native PDF không tải được. Hãy thử PDF.js hoặc Xem PDF.", true);
    } else {
      loadBrochure(brochure.id, "pdfjs");
    }
  };
  frame.addEventListener("error", fallback, { once: true });
  frame.src = pdfUrl;
  nativeViewer.replaceChildren(frame);
  hideMessage();
  fetch(pdfUrl, { method: "HEAD" }).then(response => {
    if (!isCurrent() || [405, 501].includes(response.status)) return;
    const type = response.headers.get("content-type") || "";
    const disposition = response.headers.get("content-disposition") || "";
    if (!response.ok || /attachment/i.test(disposition) || /text\/html/i.test(type)) fallback();
  }).catch(() => { });
}

async function loadBrochure(id, modeOverride = null) {
  const brochure = brochures.find(item => item.id === id);
  if (!brochure) return;
  documentVersion++;
  const version = documentVersion;
  loadStarted = performance.now();
  currentBrochureId = id;
  resetDocument();
  nativeViewer.replaceChildren();
  const mode = modeOverride || (TEST_MODE && forcedMode) || (supportsNativeEmbed() ? "native" : "pdfjs");
  setViewerMode(mode);
  const pdfUrl = getPdfUrl(brochure);
  title.textContent = brochure.title;
  document.title = `${brochure.title} | BMW Việt Nam`;
  updateActiveMenuItem(id);
  setPdfActions(pdfUrl);
  showMessage("Đang chuẩn bị trình xem brochure…");
  if (!pdfUrl) {
    showMessage("Đường dẫn PDF không hợp lệ. Kiểm tra pdfPath trong script.js.", true);
    return;
  }
  if (location.protocol === "file:") {
    if (TEST_MODE) showMessage("Vui lòng mở website qua GitHub Pages hoặc localhost (HTTP), không mở bằng file://.");
    else hideMessage();
    return;
  }
  if (mode === "native") {
    loadNativePdf(pdfUrl, brochure, version);
    return;
  }
  showMessage("Đang chuẩn bị trình xem PDF.js…");
  try {
    const pdfjs = await getPdfLibrary();
    if (version !== documentVersion) return;
    logPerformance("Thư viện sẵn sàng");
    showMessage("Đang tải e-brochure…");
    const task = pdfjs.getDocument({
      url: pdfUrl,
      disableRange: false, disableStream: false, disableAutoFetch: false,
      cMapUrl: pdfjsAssetUrl("cmaps"), cMapPacked: true,
      standardFontDataUrl: pdfjsAssetUrl("standard_fonts"),
      wasmUrl: pdfjsAssetUrl("wasm"),
      iccUrl: pdfjsAssetUrl("iccs")
    });
    loadingTask = task;
    let lastProgress = -1;
    let readingFirstPage = false;
    task.onProgress = ({ loaded, total }) => {
      const percent = total > 0 ? Math.min(100, Math.round(loaded * 100 / total)) : -1;
      if (version === documentVersion && !firstPageReady && !readingFirstPage && percent >= 0 && percent !== lastProgress) {
        lastProgress = percent;
        showMessage(`Đang tải e-brochure… ${Math.min(100, Math.round(loaded * 100 / total))}%`);
      }
    };
    const doc = await task.promise;
    if (version !== documentVersion) { await task.destroy(); return; }
    logPerformance("Đọc cấu trúc PDF xong");
    readingFirstPage = true;
    showMessage("Đang hiển thị trang đầu…");
    pdfDoc = doc;
    const firstPage = await doc.getPage(1);
    if (version !== documentVersion) return;
    const viewport = firstPage.getViewport({ scale: 1 });
    pageDimensions.set(1, { width: viewport.width, height: viewport.height });
    makePageNodes(doc);
    currentPage = 1;
    const firstGeneration = renderGeneration;
    inFlightPages.add(1);
    await renderPage(1, version, firstGeneration, true, firstPage);
    if (version !== documentVersion) return;
    inFlightPages.delete(1);
    if (!renderedPages.has(1)) throw new Error("Không thể render trang PDF đầu tiên.");
    firstPageReady = true;
    logPerformance("Trang đầu hiển thị");
    hideMessage();
    updateControls();
    lastViewerWidth = pdfScroll.clientWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (version !== documentVersion) return;
      activateObserver();
      queuePage(2);
    }));
  } catch (error) {
    if (version !== documentVersion) return;
    console.error("PDF.js không tải được brochure:", error);
    if (loadingTask) loadingTask.onProgress = null;
    let message = "Không thể tải hoặc hiển thị brochure.";
    const text = String(error?.message || "");
    if (/404|missing pdf|unexpected server response/i.test(text) || error?.status === 404) {
      message = `Không tìm thấy PDF của ${brochure.label}. Hãy upload file vào thư mục pdf/ đúng tên.`;
    } else if (/invalid pdf|formaterror/i.test(text)) {
      message = "File không phải PDF hợp lệ hoặc bị hỏng.";
    } else if (/password/i.test(text)) {
      message = "PDF yêu cầu mật khẩu; hãy dùng bản không khóa.";
    } else if (/vendor\/pdfjs|thư viện pdf\.js nội bộ/i.test(text)) {
      message = "Thiếu thư viện PDF.js nội bộ. Hãy kiểm tra thư mục vendor/pdfjs/ trên localhost hoặc GitHub Pages.";
    } else if (/fetch|network|load failed|importing a module|dynamically imported module/i.test(text)) {
      message = "Không tải được PDF hoặc tài nguyên nội bộ. Hãy kiểm tra file trên GitHub Pages và thử lại.";
    }
    showMessage(`${message} Có thể dùng nút “Xem PDF” ở thanh công cụ phía dưới.`, true);
  }
}

function goToPage(number) {
  if (!pdfDoc || !firstPageReady) return;
  number = Math.min(pdfDoc.numPages, Math.max(1, number));
  const node = pageNodes[number - 1];
  if (!node) return;
  currentPage = number;
  updateControls();
  requestNearbyPages(number);
  pdfScroll.scrollTo({ top: node.offsetTop, behavior: "smooth" });
}
function resetPageCanvases() {
  if (!pdfDoc || !firstPageReady) return;
  const anchor = currentPage;
  renderGeneration++;
  if (pageObserver) { pageObserver.disconnect(); pageObserver = null; }
  for (const task of activeRenderTasks.values()) task.cancel();
  activeRenderTasks.clear();
  activeRenders = 0;
  pendingPages = [];
  queuedPages.clear();
  inFlightPages.clear();
  renderedPages.clear();
  pageNodes.forEach((node, index) => {
    releaseCanvas(node);
    node.classList.remove("is-rendered");
    setPageSize(index + 1, node);
  });
  const anchorNode = pageNodes[anchor - 1];
  if (anchorNode) pdfScroll.scrollTop = anchorNode.offsetTop;
  activateObserver();
  requestNearbyPages(anchor);
}
function updateZoom(nextZoom) {
  if (!pdfDoc || !firstPageReady) return;
  const value = Math.min(2.5, Math.max(0.75, Math.round(nextZoom * 100) / 100));
  if (value === zoom) return;
  zoom = value;
  updateControls();
  resetPageCanvases();
}

function setMenuOpen(open) {
  menuToggle.classList.toggle("is-open", open);
  menu.classList.toggle("is-open", open);
  backdrop.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Đóng menu chọn brochure" : "Mở menu chọn brochure");
  menu.inert = !open;
  if (open) {
    const currentLink = menuList.querySelector(".menu-item.active");
    const group = currentLink?.closest(".menu-group");
    if (group) group.open = true;
  }
}

menuToggle.addEventListener("click", () => setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true"));
backdrop.addEventListener("click", () => setMenuOpen(false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false); menuToggle.focus();
  }
  const target = event.target;
  if (target instanceof Element && target.closest("button, a, input, textarea, select")) return;
  if (event.key === "ArrowRight" && pdfDoc) goToPage(currentPage + 1);
  if (event.key === "ArrowLeft" && pdfDoc) goToPage(currentPage - 1);
});
retryButton.addEventListener("click", () => { if (currentBrochureId) loadBrochure(currentBrochureId, activeViewerMode); });
function forceTestViewer(mode) {
  if (!TEST_MODE || !currentBrochureId) return;
  forcedMode = mode;
  if (activeViewerMode !== mode) loadBrochure(currentBrochureId, mode);
}
testNative.addEventListener("click", () => forceTestViewer("native"));
testPdfjs.addEventListener("click", () => forceTestViewer("pdfjs"));
prevPage.addEventListener("click", () => goToPage(currentPage - 1));
nextPage.addEventListener("click", () => goToPage(currentPage + 1));
zoomOut.addEventListener("click", () => updateZoom(zoom - 0.25));
zoomIn.addEventListener("click", () => updateZoom(zoom + 0.25));
fitWidth.addEventListener("click", () => updateZoom(1));
pdfScroll.addEventListener("scroll", () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => { scrollScheduled = false; updatePageByScroll(); });
}, { passive: true });
const resizeObserver = new ResizeObserver(() => {
  if (resizeScheduled) return;
  resizeScheduled = true;
  requestAnimationFrame(() => {
    resizeScheduled = false;
    const width = pdfScroll.clientWidth;
    if (Math.abs(width - lastViewerWidth) < 2) return;
    lastViewerWidth = width;
    if (firstPageReady) resetPageCanvases();
  });
});
resizeObserver.observe(pdfScroll);

brochureGroups.forEach(group => {
  const section = document.createElement("details");
  section.className = "menu-group";
  section.dataset.groupId = group.id;
  section.addEventListener("toggle", () => {
    if (!section.open) return;
    menuList.querySelectorAll(".menu-group").forEach(other => {
      if (other !== section) other.open = false;
    });
  });
  const heading = document.createElement("summary");
  heading.className = "menu-heading";
  heading.textContent = group.heading;
  section.appendChild(heading);
  const list = document.createElement("div");
  list.className = "menu-list";
  if (!group.items.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "menu-empty";
    emptyState.textContent = "Brochure đang được cập nhật.";
    list.appendChild(emptyState);
  }
  group.items.forEach(brochure => {
    const link = document.createElement("a");
    link.className = "menu-item";
    link.href = getBrochureHref(brochure.id);
    link.textContent = brochure.label;
    link.dataset.brochureId = brochure.id;
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      loadBrochure(brochure.id);
      updateBrochureUrl(brochure.id);
      setMenuOpen(false);
      menuToggle.focus();
    });
    list.appendChild(link);
  });
  section.appendChild(list);
  menuList.appendChild(section);
});

window.addEventListener("popstate", () => {
  const brochure = getBrochureFromUrl();
  if (brochure) loadBrochure(brochure.id);
  setMenuOpen(false);
});
if (brochures.length) loadBrochure(getBrochureFromUrl().id);
else {
  showMessage("Chưa có e-brochure nào.");
  menuToggle.disabled = true;
}
