const colors = ['var(--green)', 'var(--purple)', 'var(--pink)', 'var(--yellow)', 'var(--orange)', 'var(--green)'];

export default function Logo() {
  return (
    <span className="logo">
      {"meme'd".split('').map((ch, i) => (
        <span key={i} style={{ color: colors[i % colors.length] }}>
          {ch}
        </span>
      ))}
    </span>
  );
}