const invalidTokens = new Set();

const invalidarJWT = (token) => {
	invalidTokens.add(token);
};

module.exports = {
	invalidarJWT,
	invalidTokens,
};
