
const Loader = ({
  fullPage = false,
  size = "medium"
}) => {
  return (
    <div
      className={`loader-wrapper ${
        fullPage
          ? "loader-full-page"
          : ""
      }`}
    >
      <div
        className={`loader loader-${size}`}
      />
    </div>
  );
};

export default Loader;
