import { Schema, model } from "mongoose";

const currencyExchangeSchema = new Schema(
  {
    baseCurrency: { type: String, required: true },
    targetCurrency: { type: String, required: true },
    exchangeRate: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
  }
);

export default model("CurrencyExchange", currencyExchangeSchema);
