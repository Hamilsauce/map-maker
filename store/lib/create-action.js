export const createAction = (type, propsDefinition) => {
  if (propsDefinition) {
    return (props = propsDefinition) => {
      const valid = Object.entries((propsDefinition)).every(([k, v]) => props[k] && props[k].constructor === v);

      if (!valid) throw new Error(`[Bad props passed to action. Action, Props]: ${type}, ${JSON.stringify(props)}`);

      return { ...props, type };
    }
  }

  else return () => ({ type });
};