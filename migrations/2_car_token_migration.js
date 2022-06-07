const CarToken = artifacts.require("CarToken");

module.exports = function (deployer) {
  deployer.deploy(CarToken, "Carsy", "CARSY");
};
