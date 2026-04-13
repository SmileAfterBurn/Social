export const colors = {
  bg:        "#0a0a0a",
  card:      "#111111",
  border:    "#222222",
  green:     "#00d26a",
  red:       "#ff4757",
  yellow:    "#ffd32a",
  cyan:      "#18dcff",
  white:     "#f1f2f6",
  gray:      "#747d8c",
  gold:      "#ffa502",
};

export const text = {
  h1:    { fontSize: 22, fontWeight: "700", color: colors.white },
  h2:    { fontSize: 17, fontWeight: "600", color: colors.white },
  h3:    { fontSize: 14, fontWeight: "600", color: colors.white },
  body:  { fontSize: 13, color: colors.white },
  small: { fontSize: 11, color: colors.gray },
  mono:  { fontSize: 12, fontFamily: "monospace", color: colors.white },
};

// Shared layout styles
export const layout = {
  screen:    { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16 },
  card:      {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  row:       { flexDirection: "row", alignItems: "center" },
  spacer:    { height: 12 },
};
