"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2 } from "lucide-react";

import { createProductAction } from "@/lib/actions/product";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = { status: "idle" };

const CATEGORY_SUGGESTIONS = [
  "Fashion",
  "Elektronik",
  "Kecantikan",
  "Rumah Tangga",
  "Olahraga",
  "Makanan",
];

type VariantDraft = {
  sku: string;
  name: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  options: Record<string, string>;
};

export function ProductForm() {
  const [state, formAction] = useActionState(createProductAction, initialState);
  const [optionNames, setOptionNames] = useState<string[]>([]);
  const [optionValues, setOptionValues] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([
    { sku: "", name: "", price: "", compareAtPrice: "", stock: "", options: {} },
  ]);

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant, position) => (position === index ? { ...variant, ...patch } : variant)),
    );
  }

  function firstValues() {
    return optionValues.map((valueList) => valueList.split(",")[0]?.trim() ?? "");
  }

  /** Nama varian otomatis gabungan dari nilai opsi pertama. */
  function addVariant() {
    const names = optionNames.map((name) => name.trim()).filter(Boolean);
    const values = firstValues();
    const options = Object.fromEntries(names.map((name, index) => [name, values[index] ?? ""]));

    setVariants((current) => [
      ...current,
      {
        sku: "",
        name: names.map((name, index) => `${name}: ${values[index] ?? "-"}`).join(" / "),
        price: "",
        compareAtPrice: "",
        stock: "",
        options,
      },
    ]);
  }

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold">Informasi dasar</h2>

        <div>
          <Label htmlFor="name">Nama produk</Label>
          <Input id="name" name="name" className="mt-1" placeholder="Kaus katun unisex premium" />
          {state.fieldErrors?.name?.[0] ? (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            className="mt-1"
            placeholder="Bahan, ukuran, keunggulan, cara perawatan..."
          />
          {state.fieldErrors?.description?.[0] ? (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.description[0]}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="category">Kategori</Label>
          <Input
            id="category"
            name="category"
            list="category-options"
            className="mt-1"
            placeholder="Pilih atau tulis kategori"
          />
          <datalist id="category-options">
            {CATEGORY_SUGGESTIONS.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold">Gambar produk</h2>
        <p className="text-xs text-muted-foreground">
          Satu URL per baris. Baris pertama menjadi gambar utama.
        </p>
        <Textarea
          name="images"
          rows={4}
          className="font-mono text-xs"
          placeholder={"https://.../foto-1.jpg\nhttps://.../foto-2.jpg"}
        />
        {state.fieldErrors?.images?.[0] ? (
          <p className="text-xs text-destructive">{state.fieldErrors.images[0]}</p>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border p-4">
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
        <p className="text-xs text-muted-foreground">
          Opsional. Contoh: Warna = Merah, Hitam. Nilai dipisah koma.
        </p>

        {optionNames.map((name, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs" htmlFor={`option-name-${index}`}>
                Nama opsi
              </Label>
              <Input
                id={`option-name-${index}`}
                value={name}
                onChange={(event) =>
                  setOptionNames((current) =>
                    current.map((value, position) =>
                      position === index ? event.target.value : value,
                    ),
                  )
                }
                placeholder="Warna"
                className="mt-1"
              />
              <input type="hidden" name="optionName" value={name} />
            </div>
            <div>
              <Label className="text-xs" htmlFor={`option-values-${index}`}>
                Nilai opsi
              </Label>
              <Input
                id={`option-values-${index}`}
                value={optionValues[index] ?? ""}
                onChange={(event) =>
                  setOptionValues((current) =>
                    current.map((value, position) =>
                      position === index ? event.target.value : value,
                    ),
                  )
                }
                placeholder="Merah, Hitam, Putih"
                className="mt-1"
              />
              {name.trim() ? (
                <input type="hidden" name={`option:${name.trim()}`} value={optionValues[index] ?? ""} />
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-xl border p-4">
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
                <Label className="text-xs" htmlFor={`sku-${index}`}>
                  SKU
                </Label>
                <Input
                  id={`sku-${index}`}
                  value={variant.sku}
                  onChange={(event) => updateVariant(index, { sku: event.target.value })}
                  placeholder="KKS-MER-M"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`variant-name-${index}`}>
                  Nama varian
                </Label>
                <Input
                  id={`variant-name-${index}`}
                  value={variant.name}
                  onChange={(event) => updateVariant(index, { name: event.target.value })}
                  placeholder="Merah / M"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`price-${index}`}>
                  Harga (Rp)
                </Label>
                <Input
                  id={`price-${index}`}
                  inputMode="numeric"
                  value={variant.price}
                  onChange={(event) => updateVariant(index, { price: event.target.value })}
                  placeholder="150000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`compare-${index}`}>
                  Harga coret (opsional)
                </Label>
                <Input
                  id={`compare-${index}`}
                  inputMode="numeric"
                  value={variant.compareAtPrice}
                  onChange={(event) => updateVariant(index, { compareAtPrice: event.target.value })}
                  placeholder="200000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor={`stock-${index}`}>
                  Stok
                </Label>
                <Input
                  id={`stock-${index}`}
                  inputMode="numeric"
                  value={variant.stock}
                  onChange={(event) => updateVariant(index, { stock: event.target.value })}
                  placeholder="20"
                  className="mt-1"
                />
              </div>
            </div>

            {optionNames.filter((name) => name.trim()).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {optionNames.map((name, optionIndex) =>
                  name.trim() ? (
                    <div key={optionIndex}>
                      <Label className="text-xs" htmlFor={`option-${index}-${optionIndex}`}>
                        {name.trim()}
                      </Label>
                      <Input
                        id={`option-${index}-${optionIndex}`}
                        value={variant.options[name.trim()] ?? ""}
                        onChange={(event) =>
                          updateVariant(index, {
                            options: {
                              ...variant.options,
                              [name.trim()]: event.target.value,
                            },
                          })
                        }
                        placeholder={optionValues[optionIndex]?.split(",")[0]?.trim() ?? "nilai"}
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

        {state.fieldErrors?.variants?.[0] ? (
          <p className="text-xs text-destructive">{state.fieldErrors.variants[0]}</p>
        ) : null}
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
      {pending ? "Menyimpan..." : "Simpan produk"}
    </Button>
  );
}