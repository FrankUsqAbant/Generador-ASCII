// Paleta de caracteres ASCII de oscuro a claro
const ASCII_CHARS = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.'];

// Función para obtener el nivel de gris de un píxel (promedio de R, G, B)
const getGrayscale = (r: number, g: number, b: number) => (r + g + b) / 3;

export const imageToAscii = (
    img: HTMLImageElement,
    context: CanvasRenderingContext2D,
    width: number
): string => {
    // Calcular el nuevo alto para mantener la relación de aspecto
    const aspectRatio = img.height / img.width;
    const height = Math.floor(width * aspectRatio * 0.5); // *0.5 para ajustar por la altura de los caracteres

    // Dibujar la imagen en el canvas con el nuevo tamaño
    context.canvas.width = width;
    context.canvas.height = height;
    context.drawImage(img, 0, 0, width, height);

    // Obtener los datos de píxeles del canvas
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let asciiImage = '';

    // Iterar sobre cada píxel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];

            const gray = getGrayscale(r, g, b);

            // Mapear el nivel de gris a un carácter ASCII
            const charIndex = Math.floor((gray / 255) * (ASCII_CHARS.length - 1));
            asciiImage += ASCII_CHARS[charIndex];
        }
        asciiImage += '\n'; // Nueva línea al final de cada fila
    }

    return asciiImage;
};
