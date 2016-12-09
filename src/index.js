import loadRoutes from './routes/load_routes';

// compile
const compileConfiguration = (options = {}, bitsConfig) => {
  return {
    ...options,
    ...bitsConfig,
  };
};

export default (options) => {
  return {
    loadRoutes: (bitsConfig) => {
      const config = compileConfiguration(options, bitsConfig);
      return loadRoutes(config);
    }
  };
};
