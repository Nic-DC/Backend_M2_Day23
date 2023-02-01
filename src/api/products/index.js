import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import ProductsModel from "./model.js";

const { NotFound } = createHttpError;

export const productsRouter = express.Router();

productsRouter.post("/", async (req, res, next) => {
  try {
    const product = await ProductsModel.create(req.body);
    res.status(201).send(product);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.name) {
      query.name = { [Op.iLike]: `${req.query.name}%` };
      const filteredProducts = await ProductsModel.findAll({
        where: { ...query },
        attributes: ["name", "category", "price"],
      });
      res.send(filteredProducts);
    } else {
      const products = await ProductsModel.findAll();
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const searchedProduct = await ProductsModel.findByPk(req.params.productId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }, // (SELECT) pass an object with exclude property for the omit list
    });
    if (searchedProduct) {
      res.send(searchedProduct);
    } else {
      next(NotFound(`The product with id: ${req.params.productId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const [numerOfUpdatedRows, updatedRecords] = await ProductsModel.update(req.body, {
      where: { id: req.params.productId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      returning: true,
    });
    console.log(`We're UPDATING - numerOfUpdatedRows: ${numerOfUpdatedRows}, updatedRecords: ${updatedRecords}`);
    if (numerOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(NotFound(`The product with id: ${req.params.productId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ProductsModel.destroy({
      where: { id: req.params.productId },
    });

    if (numberOfDeletedRows === 1) {
      res.send({ message: `Product with id: ${req.params.productId} successfully deleted` });
    } else {
      next(NotFound(`The product with id: ${req.params.productId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});
