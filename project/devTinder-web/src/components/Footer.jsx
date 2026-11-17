const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content/70 p-4 text-sm">
      <aside>
        <p>© {new Date().getFullYear()} DevTinder · Find developers to build with</p>
      </aside>
    </footer>
  );
};

export default Footer;
