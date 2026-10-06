"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2 } from "lucide-react";

import { updateProductAction } from "@/lib/actions/product";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = { status: "idle" };

type EditableProduct = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  options: string[];
  images: { url: string }[];
  variants: {
    sku: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    options: unknown;
  }[];
};

type VariantDraft = {
  sku: string;
  name: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  options: Record<string, string>;
};

function toDraft(variant: EditableProduct["variants"][number]): VariantDraft {
  const options =
    variant.options && typeof variant.options === "object" && !Array.isArray(variant.options)
      ? (variant.options as Record<string, string>)
      : {};

  return {
    sku: variant.sku,
    name: variant.name,
    price: String(variant.price),
    compareAtPrice: variant.compareAtPrice === null ? "" : String(variant.compareAtPrice),
    stock: String(variant.stock),
    options: Object.fromEntries(
      Object.entries(options).map(([key, value]) => [key, String(value ?? "")]),
    ),
  };
}

export function ProductEditForm({ product }: { product: EditableProduct }) {
  const updateWithId = (prev: ActionState, formData: FormData) =>
    updateProductAction(product.id, prev, formData);
  const [state, formAction] = useActionState(updateWithId, initialState);

  const [optionNames, setOptionNames] = useState<string[]>(product.options);
  const [optionValues, setOptionValues] = useState<string[]>(() =>
    product.options.map((name) =>
      product.variants
        .map((variant) =>
          variant.options && typeof variant.options === "object" && !Array.isArray(variant.options)
            ? ((variant.options as Record<string, string>)[name] ?? "")
            : "",
        )
        .filter(Boolean)
        .join(", "),
    ),
  );
  const [variants, setVariants] = useState<VariantDraft[]>(() =>
    product.variants.map(toDraft),
  );

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant, position) => (position === index ? { ...variant, ...patch } : variant)),
    );
  }

  function addVariant() {
    const names = optionNames.map((name) => name.trim()).filter(Boolean);
    const firsts = optionValues.map((list) => list.split(",")[0]?.trim() ?? "");

    setVariants((current) => [
      ...current,
      {
        sku: "",
        name: names.map((name, index) => `${name}: ${firsts[index] ?? "-"}`).join(" / "),
        price: "",
        compareAtPrice: "",
        stock: "",
        options: Object.fromEntries(names.map((name, index) => [name, firsts[index] ?? ""])),
      },
    ]);
  }

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-4 rounded-xl border p-4">
        <div>
          <Label htmlFor="name">Nama produk</Label>
          <Input id="name" name="name" defaultValue={product.name} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={product.description}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <Input id="category" name="category" defaultValue={product.category ?? ""} className="mt-1" />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold">Gambar produk</h2>
        <p className="text-xs text-muted-foreground">Satu URL per baris, urut dari gambar utama.</p>
        <Textarea
          name="images"
          rows={4}
          className="font-mono text-xs"
          defaultValue={product.images.map((image) => image.url).join("\n")}
        />
      </section>

      <section className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Opsi variasi</h2>
          {optionNames.length < 3 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setOptionNames((current) => [...current, ""]);
                setOptionValues((current) => [...current, ""]);
              }}
            >
              <Plus className="size-3.5" /> Tambah opsi
            </Button>
          ) : null}
        </div>

        {optionNames.map((name, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs" htmlFor={`edit-option-name-${index}`}>
                Nama opsi
              </Label>
              <Input
                id={`edit-option-name-${index}`}
                value={name}
                onChange={(event) =>
                  setOptionNames((current) =>
                    current.map((value, position) =>
                      position === index ? event.target.value : value,
                    ),
                  )
                }
                className="mt-1"
              />
              <input type="hidden" name="optionName" value={name} />
            </div>
            <div>
              <Label className="text-xs" htmlFor={`edit-option-values-${index}`}>
                Nilai opsi
              </Label>
              <Input
                id={`edit-option-values-${index}`}
                value={optionValues[index] ?? ""}
                onChange={(event) =>
                  setOptionValues((current) =>
                    current.map((value, position) =>
                      position === index ? event.target.value : value,
                    ),
                  )
                }
                className="mt-1"
              />
              {name.trim() ? (
                <input type="hidden" name={`option:${name.trim()}`} value={optionValues[index] ?? ""} />
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Varian (SKU)</h2>
          <Button type="button" size="sm" variant="outline" onClick={addVariant}>
            <Plus className="size-3.5" /> Tambah varian
          </Button>
        </div>

        {variants.map((variant, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-3">
            <input type="hidden" name="variant" value={JSON.stringify(variant)} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs" htmlFor={`edit-sku-${index}`}>
                  SKU
                </Label>
                <Input
                  id={`edit-sku-${index}`}
                  value={variant.sku}
                  onChange={(event) => updateVariant(index, { sku: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`edit-variant-name-${index}`}>
                  Nama varian
                </Label>
                <Input
                  id={`edit-variant-name-${index}`}
                  value={variant.name}
                  onChange={(event) => updateVariant(index, { name: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`edit-price-${index}`}>
                  Harga (Rp)
                </Label>
                <Input
                  id={`edit-price-${index}`}
                  inputMode="numeric"
                  value={variant.price}
                  onChange={(event) => updateVariant(index, { price: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`edit-compare-${index}`}>
                  Harga coret
                </Label>
                <Input
                  id={`edit-compare-${index}`}
                  inputMode="numeric"
                  value={variant.compareAtPrice}
                  onChange={(event) => updateVariant(index, { compareAtPrice: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`edit-stock-${index}`}>
                  Stok
                </Label>
                <Input
                  id={`edit-stock-${index}`}
                  inputMode="numeric"
                  value={variant.stock}
                  onChange={(event) => updateVariant(index, { stock: event.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {optionNames.filter((name) => name.trim()).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {optionNames.map((name, optionIndex) =>
                  name.trim() ? (
                    <div key={optionIndex}>
                      <Label className="text-xs" htmlFor={`edit-option-${index}-${optionIndex}`}>
                        {name.trim()}
                      </Label>
                      <Input
                        id={`edit-option-${index}-${optionIndex}`}
                        value={variant.options[name.trim()] ?? ""}
                        onChange={(event) =>
                          updateVariant(index, {
                            options: { ...variant.options, [name.trim()]: event.target.value },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}

            {variants.length > 1 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  setVariants((current) => current.filter((_, position) => position !== index))
                }
              >
                <Trash2 className="size-3.5" /> Hapus varian
              </Button>
            ) : null}
          </div>
        ))}
      </section>

      {state.status === "error" ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan perubahan"}
    </Button>
  );
}