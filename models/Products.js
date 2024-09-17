import mongoose, { model, Schema, models } from "mongoose";

const ProductSchema = new Schema({
  title: {type: String, required: true},
  slug: {type: String, required: true, unique: true},
  description: String,
  price: {type: Number, required: true},
  cost: { type: Number, required: true },
  images: [{type: String}],
  category: {type: mongoose.Types.ObjectId, ref: 'Category'},
  properties: {type: Object},
  ratings: [{
    rating: Number,
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true,
});

// دالة مساعدة لإنشاء الـ slug
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
}

// تحديث الـ pre-save hook
ProductSchema.pre('save', async function(next) {
  if (!this.slug) {
    let baseSlug = createSlug(this.title);
    let slug = baseSlug;
    let counter = 1;
    
    // التحقق من وجود slug مماثل والتعديل إذا لزم الأمر
    while (true) {
      const existingProduct = await this.constructor.findOne({ slug: slug });
      if (!existingProduct) {
        this.slug = slug;
        break;
      }
      // إذا وجد slug مماثل، أضف رقم تسلسلي
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  next();
});

export const Product = models.Product || model('Product', ProductSchema);
