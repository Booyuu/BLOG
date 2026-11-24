export const blogHeroImage = 'https://images.unsplash.com/photo-1686349472661-ff361a66834b?q=80&w=3270&auto=format&fit=crop';

export default function BlogHero({ image = blogHeroImage, label, title, description }) {
  return <header className="legacy-hero">
    <img src={image} alt="" fetchPriority="high" />
    <div className="legacy-hero-title">
      <span>{label}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  </header>;
}
