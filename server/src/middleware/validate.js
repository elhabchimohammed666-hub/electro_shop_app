export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    if (error) {
      return res.status(400).json({
        message: 'Vérifiez les informations saisies.',
        details: error.details.map(({ message }) => message)
      });
    }
    if (source === 'query') req.validatedQuery = value;
    else req[source] = value;
    next();
  };
}
