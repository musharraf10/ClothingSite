import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/client.js";
import { useToast } from "../../components/ui/ToastProvider.jsx";

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  basePrice: "",
  category: "",
  images: ["", "", "", "", "", ""],
  sizes: DEFAULT_SIZES.map((size) => ({ size, stock: "0" })),
  sizeChart: { text: "", image: "" },
  washCare: "",
  isNewCollection: false,
  isUpcoming: false,
  isActive: true,
};

export function AdminProductFormPage() {
  const [searchParams] = useSearchParams();
  const { id: routeProductId } = useParams();
  const editId = routeProductId || searchParams.get("edit");
  const isEdit = Boolean(editId);
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image: "",
  });

  const title = useMemo(() => (isEdit ? "Edit product" : "Create product"), [isEdit]);

  useEffect(() => {
    api.get("/admin/categories").then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    if (!isEdit || !editId) return;
    api
      .get(`/admin/products/${editId}`)
      .then(({ data }) => {
        const imageSlots = Array.from({ length: 6 }, (_, idx) => data.images?.[idx] || "");
        const normalizedSizes = DEFAULT_SIZES.map((size) => {
          const match = (data.sizes || []).find((entry) => entry.size === size);
          return { size, stock: String(match?.stock ?? 0) };
        });
        setForm({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          basePrice: String(data.basePrice ?? ""),
          category: typeof data.category === "object" ? (data.category?._id || "") : (data.category || ""),
          images: imageSlots,
          sizes: normalizedSizes,
          sizeChart: {
            text: data.sizeChart?.text || "",
            image: data.sizeChart?.image || "",
          },
          washCare: data.washCare || "",
          isNewCollection: Boolean(data.isNewCollection),
          isUpcoming: Boolean(data.isUpcoming),
          isActive: data.isActive !== false,
        });
      })
      .catch(() => {
        notify("Product not found", "error");
        navigate("/admin/products");
      });
  }, [editId, isEdit, navigate, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validImages = form.images.map((img) => String(img || "").trim()).filter(Boolean);
    if (validImages.length !== 6) {
      notify("Exactly 6 images are required", "error");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      category: form.category || undefined,
      images: validImages,
      sizes: form.sizes.map((entry) => ({ size: entry.size, stock: Number(entry.stock) || 0 })),
      sizeChart: {
        text: String(form.sizeChart?.text || "").trim(),
        image: String(form.sizeChart?.image || "").trim(),
      },
      washCare: String(form.washCare || "").trim(),
      isNewCollection: Boolean(form.isNewCollection),
      isUpcoming: Boolean(form.isUpcoming),
      isActive: Boolean(form.isActive),
    };

    setSubmitting(true);
    try {
      if (isEdit) await api.put(`/admin/products/${editId}`, payload);
      else await api.post("/admin/products", payload);
      navigate("/admin/products");
    } catch (error) {
      notify(error.response?.data?.message || "Failed to save product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !newCategory.image.trim()) {
      notify("Category name and image URL are required", "error");
      return;
    }

    setCreatingCategory(true);
    try {
      const payload = {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        image: newCategory.image.trim(),
      };
      const { data } = await api.post("/admin/categories", payload);
      const updatedCategories = [...categories, data].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      );
      setCategories(updatedCategories);
      setForm((prev) => ({ ...prev, category: data?._id || prev.category }));
      setNewCategory({ name: "", description: "", image: "" });
      notify("Category created", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Failed to create category", "error");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-card rounded-xl border border-[#262626] p-6 space-y-4">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <input required placeholder="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
        </div>

        <textarea required placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />

        <div className="grid md:grid-cols-2 gap-3">
          <input type="number" required min="0" placeholder="Base price" value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white">
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 rounded-lg border border-[#262626] bg-primary p-3">
          <p className="text-sm font-medium text-white">Create category (for Collection images)</p>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-lg border border-[#262626] bg-[#101010] px-3 py-2 text-white"
            />
            <input
              placeholder="Category image URL"
              value={newCategory.image}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, image: e.target.value }))}
              className="rounded-lg border border-[#262626] bg-[#101010] px-3 py-2 text-white"
            />
            <input
              placeholder="Category description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded-lg border border-[#262626] bg-[#101010] px-3 py-2 text-white"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateCategory}
            disabled={creatingCategory}
            className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent disabled:opacity-60"
          >
            {creatingCategory ? "Creating..." : "Create Category"}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Images (6 required)</p>
          {form.images.map((url, idx) => (
            <input
              key={`image-${idx}`}
              placeholder={`Image ${idx + 1} URL`}
              value={url}
              onChange={(e) => {
                const next = [...form.images];
                next[idx] = e.target.value;
                setForm((p) => ({ ...p, images: next }));
              }}
              className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white"
            />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Stock by size</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {form.sizes.map((entry, idx) => (
              <label key={entry.size} className="space-y-1">
                <span className="text-xs text-muted">{entry.size}</span>
                <input
                  type="number"
                  min="0"
                  value={entry.stock}
                  onChange={(e) => {
                    const next = [...form.sizes];
                    next[idx] = { ...next[idx], stock: e.target.value };
                    setForm((p) => ({ ...p, sizes: next }));
                  }}
                  className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input placeholder="Size chart text (optional)" value={form.sizeChart.text} onChange={(e) => setForm((p) => ({ ...p, sizeChart: { ...p.sizeChart, text: e.target.value } }))} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <input placeholder="Size chart image URL (optional)" value={form.sizeChart.image} onChange={(e) => setForm((p) => ({ ...p, sizeChart: { ...p.sizeChart, image: e.target.value } }))} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
        </div>

        <textarea
          rows={3}
          placeholder="Wash care instructions (optional)"
          value={form.washCare}
          onChange={(e) => setForm((p) => ({ ...p, washCare: e.target.value }))}
          className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white"
        />

        <div className="grid md:grid-cols-3 gap-3">
          <label className="flex items-center justify-between border border-[#262626] rounded-lg px-3 py-2 text-sm text-white">
            <span>New Collection</span>
            <input type="checkbox" checked={form.isNewCollection} onChange={(e) => setForm((p) => ({ ...p, isNewCollection: e.target.checked }))} />
          </label>
          <label className="flex items-center justify-between border border-[#262626] rounded-lg px-3 py-2 text-sm text-white">
            <span>Upcoming</span>
            <input type="checkbox" checked={form.isUpcoming} onChange={(e) => setForm((p) => ({ ...p, isUpcoming: e.target.checked }))} />
          </label>
          <label className="flex items-center justify-between border border-[#262626] rounded-lg px-3 py-2 text-sm text-white">
            <span>Active</span>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          </label>
        </div>

        <button disabled={submitting} type="submit" className="w-full rounded-xl bg-accent text-primary py-2.5 font-semibold disabled:opacity-50">
          {submitting ? "Saving..." : isEdit ? "Update product" : "Create product"}
        </button>
      </form>
    </div>
  );
}
