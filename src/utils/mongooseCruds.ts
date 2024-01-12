import { FilterQuery, Model, QueryOptions, UpdateQuery, connect, disconnect } from 'mongoose';

// ------------------- Handle Error -------------------
const handleError = (action: string, error: any): never => {
  console.error(`Error performing ${action}:`, error.message);
  throw new Error(`Error performing ${action}`);
};

// ------------------- Connect to database -------------------
export const connectToDB = async (DatabaseURL: string): Promise<void> => {
  try {
    const dbUri = DatabaseURL;
    await connect(dbUri);
    console.log('Connect to database successfully');
  } catch (err: any) {
    throw new Error(`Error connecting to MongoDB: ${err}`);
  }
};

// ------------------- Disconnect to database -------------------
export const dbDisconnect = async () : Promise<void> => {
  try {
    await disconnect();
    console.log("Database disconnect");
  } catch (err: any) {
    console.log("Cannot disconnect to database");
    throw new Error(err);
  }
};

// ------------------- Create Document -------------------
export const createItem = async<T>(model:Model<T>, item:Partial<T>): Promise<T | null> => {
  try {
    const newItem = await model.create(item);
    return newItem;
  } catch (err: any) {
    handleError('create', err);
    return null
  }
};

// ------------------- Read Document -------------------
export const getItem = async<T>(model: Model<T>, query: FilterQuery<T>): Promise<T | null> => {
  try {
    const item = await model.findOne(query);
    return item;
  } catch (err: any) {
    handleError('get', err);
    return null;
  }
};

// ------------------- Get Specific Fields From Document -------------------
export const getSpecificFields = async<T>(model: Model<T>, query: FilterQuery<T>, fields: string[]): Promise<Partial<T> | null> => {
  try {
    const result = await model.findOne(query).select(fields.join(' '));
    return result;
  } catch (err: any) {
    handleError('getSpecificFields', err);
    return null;
  }
};

// ------------------- Read Document -------------------
// Sort option type
type SortOptions<T> = {
  [key in keyof T]?: 1 | -1;
};

export const getItems = async<T>(model: Model<T>, query: FilterQuery<T>, sort?: string, fields?: string, page: string = "", limit: string = ""): Promise<T[]> => {
  try {
    // Sorting
    let sortCriteria:{} = sort ? traitStrToObj(sort) : {createdAt: -1};
    // Fields
    let fieldsCriteria: string = fields ? fields.split(",").join(" ") : "-__v";

    // Pagination
    const skip: number = (Number(page) - 1) * Number(limit);
    if(page) {
      const itemsCount = await model.countDocuments();
      if(skip && skip >= itemsCount) throw new Error("This page does not exsist");
    }
    
    let itemsQuery: T[] | null = await model.find(query).sort(sortCriteria).select(fieldsCriteria).limit(+limit).skip(skip).exec();
    const items: T[] = await itemsQuery;
    return items;
  } catch (err: any) {
    if(err.message == "This page does not exsist") handleError('This page does not exsist', null);
    handleError('getItems', err);
    return [];
  }
};

// ------------------- Update Document -------------------
export const updateItem = async<T>(model: Model<T>, query: FilterQuery<T>, updates: UpdateQuery<T>): Promise<T | null> => {
  try {
    const updatedItem = await model.findOneAndUpdate(query, updates, {new: true});
    return updatedItem;
  } catch (err: any) {
    handleError('updateItem', err);
    return null;
  }
};

// ------------------- Update Specific Fields From Document -------------------
export const updateSpecificFields = async<T>(model: Model<T>, query: FilterQuery<T>, updates: Partial<T>): Promise<T | null> => {
  try {
    const updatedItem = await model.findOneAndUpdate(query, updates, { new: true });
    return updatedItem;
  } catch (err) {
    handleError('update specific fields', err);
    return null;
  }
};

// ------------------- Delete Document -------------------
export const deleteItem = async<T>(model: Model<T>, query: FilterQuery<T>): Promise<T | null> => {
  try {
    const deletedItem = await model.findOneAndDelete(query);
    return deletedItem;
  } catch (err: any) {
    handleError('updateItem', err);
    return null;
  }
};

// ------------------- Configure List -------------------
// Transfer from "word, word2" to {word: 1|-1, word2: 1|-1 }
const traitStrToObj = (query: string): {} => {
  // Sorting
  let sortCriteria = {};
  const fields = query.split(',').map((field) => field.trim());
  fields.forEach((field) => {
    const sortOrder = field.startsWith('-') ? -1 : 1;
    const sortField = field.startsWith('-') ? field.slice(1) : field;
    sortCriteria = {...sortCriteria, [sortField] : sortOrder as 1 | -1};
  });
  return sortCriteria;
}