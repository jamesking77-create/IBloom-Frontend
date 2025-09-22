export const getColorHex = (colorName)=>{
  const colorMap = {
    aqua: "#00FFFF",
    black: "#000000",
    blue: "#0000FF",
    fuchsia: "#FF00FF",
    gray: "#808080",
    grey: "#808080",
    green: "#008000",
    lime: "#00FF00",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#FFA500",
    purple: "#800080",
    red: "#FF0000",
    silver: "#C0C0C0",
    teal: "#008080",
    white: "#FFFFFF",
    yellow: "#FFFF00",
    aliceblue: "#F0F8FF",
    antiquewhite: "#FAEBD7",
    aquamarine: "#7FFFD4",
    azure: "#F0FFFF",
    beige: "#F5F5DC",
    bisque: "#FFE4C4",
    blanchedalmond: "#FFEBCD",
    blueviolet: "#8A2BE2",
    brown: "#A52A2A",
    burlywood: "#DEB887",
    cadetblue: "#5F9EA0",
    chartreuse: "#7FFF00",
    chocolate: "#D2691E",
    coral: "#FF7F50",
    cornflowerblue: "#6495ED",
    cornsilk: "#FFF8DC",
    crimson: "#DC143C",
    cyan: "#00FFFF",
    darkblue: "#00008B",
    darkcyan: "#008B8B",
    darkgoldenrod: "#B8860B",
    darkgray: "#A9A9A9",
    darkgrey: "#A9A9A9",
    darkgreen: "#006400",
    darkkhaki: "#BDB76B",
    darkmagenta: "#8B008B",
    darkolivegreen: "#556B2F",
    darkorange: "#FF8C00",
    darkorchid: "#9932CC",
    darkred: "#8B0000",
    darksalmon: "#E9967A",
    darkseagreen: "#8FBC8F",
    darkslateblue: "#483D8B",
    darkslategray: "#2F4F4F",
    darkslategrey: "#2F4F4F",
    darkturquoise: "#00CED1",
    darkviolet: "#9400D3",
    deeppink: "#FF1493",
    deepskyblue: "#00BFFF",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1E90FF",
    firebrick: "#B22222",
    floralwhite: "#FFFAF0",
    forestgreen: "#228B22",
    gainsboro: "#DCDCDC",
    ghostwhite: "#F8F8FF",
    gold: "#FFD700",
    goldenrod: "#DAA520",
    greenyellow: "#ADFF2F",
    honeydew: "#F0FFF0",
    hotpink: "#FF69B4",
    indianred: "#CD5C5C",
    indigo: "#4B0082",
    ivory: "#FFFFF0",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    lavenderblush: "#FFF0F5",
    lawngreen: "#7CFC00",
    lemonchiffon: "#FFFACD",
    lightblue: "#ADD8E6",
    lightcoral: "#F08080",
    lightcyan: "#E0FFFF",
    lightgoldenrodyellow: "#FAFAD2",
    lightgray: "#D3D3D3",
    lightgrey: "#D3D3D3",
    lightgreen: "#90EE90",
    lightpink: "#FFB6C1",
    lightsalmon: "#FFA07A",
    lightseagreen: "#20B2AA",
    lightskyblue: "#87CEFA",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#B0C4DE",
    lightyellow: "#FFFFE0",
    limegreen: "#32CD32",
    linen: "#FAF0E6",
    magenta: "#FF00FF",
    mediumaquamarine: "#66CDAA",
    mediumblue: "#0000CD",
    mediumorchid: "#BA55D3",
    mediumpurple: "#9370DB",
    mediumseagreen: "#3CB371",
    mediumslateblue: "#7B68EE",
    mediumspringgreen: "#00FA9A",
    mediumturquoise: "#48D1CC",
    mediumvioletred: "#C71585",
    midnightblue: "#191970",
    mintcream: "#F5FFFA",
    mistyrose: "#FFE4E1",
    moccasin: "#FFE4B5",
    navajowhite: "#FFDEAD",
    oldlace: "#FDF5E6",
    olivedrab: "#6B8E23",
    orangered: "#FF4500",
    orchid: "#DA70D6",
    palegoldenrod: "#EEE8AA",
    palegreen: "#98FB98",
    paleturquoise: "#AFEEEE",
    palevioletred: "#DB7093",
    papayawhip: "#FFEFD5",
    peachpuff: "#FFDAB9",
    peru: "#CD853F",
    pink: "#FFC0CB",
    plum: "#DDA0DD",
    powderblue: "#B0E0E6",
    rebeccapurple: "#663399",
    rosybrown: "#BC8F8F",
    royalblue: "#4169E1",
    saddlebrown: "#8B4513",
    salmon: "#FA8072",
    sandybrown: "#F4A460",
    seagreen: "#2E8B57",
    seashell: "#FFF5EE",
    sienna: "#A0522D",
    skyblue: "#87CEEB",
    slateblue: "#6A5ACD",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#FFFAFA",
    springgreen: "#00FF7F",
    steelblue: "#4682B4",
    tan: "#D2B48C",
    thistle: "#D8BFD8",
    tomato: "#FF6347",
    turquoise: "#40E0D0",
    violet: "#EE82EE",
    wheat: "#F5DEB3",
    whitesmoke: "#F5F5F5",
    yellowgreen: "#9ACD32",
  };

  const spellingVariations = {
    aquamrine: "aquamarine",
    acqua: "aqua",
    acquamarine: "aquamarine",
    biege: "beige",
    burgandy: "burgundy",
    burgondy: "burgundy",
    burgundy: "maroon",
    chartreus: "chartreuse",
    charteuse: "chartreuse",
    choclate: "chocolate",
    chocholate: "chocolate",
    corral: "coral",
    crimsen: "crimson",
    crismon: "crimson",
    cian: "cyan",
    fucsia: "fuchsia",
    fuchia: "fuchsia",
    fuschia: "fuchsia",
    fushia: "fuchsia",
    golden: "gold",
    grean: "green",
    grene: "green",
    gry: "gray",
    graey: "gray",
    indego: "indigo",
    endigo: "indigo",
    kaki: "khaki",
    kakhi: "khaki",
    levender: "lavender",
    lavendar: "lavender",
    lite: "light",
    majenta: "magenta",
    megenta: "magenta",
    mangenta: "magenta",
    marron: "maroon",
    maron: "maroon",
    mediun: "medium",
    medum: "medium",
    navey: "navy",
    navyblue: "navy",
    oragne: "orange",
    ornage: "orange",
    perpul: "purple",
    purpel: "purple",
    pruple: "purple",
    pirple: "purple",
    puple: "purple",
    purpal: "purple",
    pnk: "pink",
    pik: "pink",
    salman: "salmon",
    samon: "salmon",
    siver: "silver",
    sliver: "silver",
    steal: "steel",
    "steal blue": "steelblue",
    teel: "teal",
    teel: "teal",
    turkoise: "turquoise",
    turquiose: "turquoise",
    turqoise: "turquoise",
    turkuoise: "turquoise",
    vilot: "violet",
    violett: "violet",
    violette: "violet",
    whiet: "white",
    whte: "white",
    wite: "white",
    yelow: "yellow",
    yelow: "yellow",
    yello: "yellow",
  };

  let normalizedColor = colorName.toLowerCase().trim().replace(/\s+/g, " ");

  let noSpaceColor = normalizedColor.replace(/\s+/g, "");

  if (colorMap[noSpaceColor]) {
    return colorMap[noSpaceColor];
  }

  const multiWordPatterns = [
    {
      pattern: /^(light|dark|medium|deep|pale|dim)\s+(.+)/,
      replacement: "$1$2",
    },
    {
      pattern:
        /^(alice|antique|blanched|blue|cadet|corn|cornflower|dark|deep|dodger|floral|forest|ghost|golden|green|hot|indian|lawn|lemon|light|lime|medium|midnight|mint|misty|navajo|old|olive|orange|pale|papaya|peach|powder|rebecca|rosy|royal|saddle|sandy|sea|sky|slate|spring|steel|white|yellow)\s+(blue|green|red|pink|white|yellow|brown|gray|grey|purple|violet|orange|cyan|cream|rose|wood|drab|rod|puff|lace|smoke)/,
      replacement: "$1$2",
    },
  ];

  for (const { pattern, replacement } of multiWordPatterns) {
    const processedColor = normalizedColor.replace(pattern, replacement);
    if (colorMap[processedColor]) {
      return colorMap[processedColor];
    }
  }

  if (spellingVariations[normalizedColor]) {
    const correctedColor = spellingVariations[normalizedColor];
    if (colorMap[correctedColor]) {
      return colorMap[correctedColor];
    }
  }

  if (spellingVariations[noSpaceColor]) {
    const correctedColor = spellingVariations[noSpaceColor];
    if (colorMap[correctedColor]) {
      return colorMap[correctedColor];
    }
  }
  const findClosestColor = (input) => {
    const colors = Object.keys(colorMap);
    let minDistance = Infinity;
    let closestColor = null;

    for (const color of colors) {
      const distance = levenshteinDistance(input, color);
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        closestColor = color;
      }
    }

    return closestColor;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };
  const closestMatch = findClosestColor(noSpaceColor);
  if (closestMatch && colorMap[closestMatch]) {
    return colorMap[closestMatch];
  }
  return "#6B7280";
};
