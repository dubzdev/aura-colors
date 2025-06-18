
export interface PredefinedPalette {
  id: string;
  name: string;
  colors: [string, string, string, string, string];
}

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, ''); // Remove all non-word chars

const rawPalettes: Omit<PredefinedPalette, 'id'>[] = [
  { name: "Ocean Breeze", colors: ["#E0F7FA", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA"] },
  { name: "Sunset Vibes", colors: ["#FFCC80", "#FFA726", "#FB8C00", "#F57C00", "#EF6C00"] },
  { name: "Forest Canopy", colors: ["#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#4CAF50"] },
  { name: "Royal Purple", colors: ["#EDE7F6", "#D1C4E9", "#B39DDB", "#9575CD", "#7E57C2"] },
  { name: "Cherry Blossom", colors: ["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "#EC407A"] },
  { name: "Desert Mirage", colors: ["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726"] },
  { name: "Minty Fresh", colors: ["#E0F2F1", "#B2DFDB", "#80CBC4", "#4DB6AC", "#26A69A"] },
  { name: "Coral Reef", colors: ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350"] },
  { name: "Lavender Fields", colors: ["#F3E5F5", "#E1BEE7", "#CE93D8", "#BA68C8", "#AB47BC"] },
  { name: "Citrus Burst", colors: ["#FFFDE7", "#FFF9C4", "#FFF59D", "#FFF176", "#FFEE58"] },
  { name: "Vintage Rose", colors: ["#FBE9E7", "#FFCCBC", "#FFAB91", "#FF8A65", "#FF7043"] },
  { name: "Arctic Blue", colors: ["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6"] },
  { name: "Earthy Tones", colors: ["#EFEBE9", "#D7CCC8", "#BCAAA4", "#A1887F", "#8D6E63"] },
  { name: "Golden Hour", colors: ["#FFF8E1", "#FFECB3", "#FFE082", "#FFD54F", "#FFCA28"] },
  { name: "Emerald Isle", colors: ["#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A"] },
  { name: "Plum Delight", colors: ["#F3E5F5", "#E1BEE7", "#CE93D8", "#BA68C8", "#AA00FF"] },
  { name: "Sandy Shore", colors: ["#FAF0E6", "#F5DEB3", "#E0C8AC", "#CDAF95", "#B89B7E"] },
  { name: "Teal Appeal", colors: ["#E0F2F1", "#B2DFDB", "#80CBC4", "#4DB6AC", "#00897B"] },
  { name: "Rose Gold", colors: ["#FADBD8", "#F5B7B1", "#F1948A", "#EC7063", "#E74C3C"] },
  { name: "Deep Indigo", colors: ["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0"] },
  { name: "Pastel Dream", colors: ["#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9"] },
  { name: "Monochrome Gray", colors: ["#F5F5F5", "#EEEEEE", "#E0E0E0", "#BDBDBD", "#9E9E9E"] },
  { name: "Autumn Leaves", colors: ["#FFEB3B", "#FFC107", "#FF9800", "#F57C00", "#E65100"] },
  { name: "Sky Blue", colors: ["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3"] },
  { name: "Strawberry Shortcake", colors: ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#D32F2F"] },
  { name: "Tropical Paradise", colors: ["#00ACC1", "#00BCD4", "#4DD0E1", "#80DEEA", "#B2EBF2"] },
  { name: "Muted Rainbow", colors: ["#EF9A9A", "#FFCC80", "#FFF59D", "#A5D6A7", "#90CAF9"] },
  { name: "Electric Neon", colors: ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5"] },
  { name: "Coffee House", colors: ["#D7CCC8", "#BCAAA4", "#A1887F", "#8D6E63", "#795548"] },
  { name: "Spring Meadow", colors: ["#DCEDC8", "#C5E1A5", "#AED581", "#9CCC65", "#8BC34A"] },
  { name: "Ruby Red", colors: ["#FFEBEE", "#FFCDD2", "#E57373", "#D32F2F", "#B71C1C"] },
  { name: "Sapphire Blue", colors: ["#E3F2FD", "#BBDEFB", "#64B5F6", "#2196F3", "#1565C0"] },
  { name: "Amethyst Purple", colors: ["#F3E5F5", "#E1BEE7", "#BA68C8", "#9C27B0", "#7B1FA2"] },
  { name: "Peridot Green", colors: ["#F1F8E9", "#DCEDC8", "#AED581", "#8BC34A", "#689F38"] },
  { name: "Topaz Yellow", colors: ["#FFFDE7", "#FFF9C4", "#FFF176", "#FFEE58", "#FDD835"] },
  { name: "Garnet Glow", colors: ["#FFD180", "#FFAB40", "#FF9100", "#FF6D00", "#DD2C00"] },
  { name: "Aquamarine Splash", colors: ["#E0F7FA", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA"] },
  { name: "Opal Shimmer", colors: ["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "#E91E63"] },
  { name: "Turquoise Treasure", colors: ["#E0F2F1", "#B2DFDB", "#80CBC4", "#4DB6AC", "#26A69A"] },
  { name: "Citrine Sunshine", colors: ["#FFF9C4", "#FFF59D", "#FFF176", "#FFEE58", "#FFD600"] },
  { name: "Berry Bliss", colors: ["#FCE4EC", "#F48FB1", "#EC407A", "#D81B60", "#C2185B"] },
  { name: "Evergreen", colors: ["#E8F5E9", "#A5D6A7", "#66BB6A", "#388E3C", "#1B5E20"] },
  { name: "Twilight Purple", colors: ["#EDE7F6", "#B39DDB", "#7E57C2", "#5E35B1", "#4527A0"] },
  { name: "Sunny Orange", colors: ["#FFF3E0", "#FFCC80", "#FFA726", "#FB8C00", "#F57C00"] },
  { name: "Ocean Deep", colors: ["#E1F5FE", "#81D4FA", "#29B6F6", "#039BE5", "#0277BD"] },
  { name: "Candy Floss", colors: ["#FCE4EC", "#F8BBD0", "#F06292", "#E91E63", "#D81B60"] },
  { name: "Lime Zest", colors: ["#F9FBE7", "#F0F4C3", "#E6EE9C", "#DCE775", "#D4E157"] },
  { name: "Chocolate Brownie", colors: ["#EFEBE9", "#BCAAA4", "#8D6E63", "#6D4C41", "#4E342E"] },
  { name: "Silver Lining", colors: ["#FAFAFA", "#F5F5F5", "#EEEEEE", "#E0E0E0", "#D6D6D6"] },
  { name: "Midnight Blue", colors: ["#E8EAF6", "#9FA8DA", "#5C6BC0", "#3949AB", "#283593"] }
];

export const mockPredefinedPalettes: PredefinedPalette[] = rawPalettes.map((p, index) => ({
  ...p,
  id: slugify(p.name) || `palette-${index}`, // Fallback id if name is empty or results in empty slug
}));
