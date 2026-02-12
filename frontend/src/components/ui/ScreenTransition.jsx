function ScreenTransition({ screenKey, children }) {
  return (
    <div key={screenKey} className="screen-enter">
      {children}
    </div>
  );
}

export { ScreenTransition };
