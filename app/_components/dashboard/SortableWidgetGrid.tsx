"use client";

import { useMemo, useState, type CSSProperties, type JSX } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical } from "@phosphor-icons/react";
import { DashboardIcon } from "@/app/_components/dashboard/IconLibrary";
import type { WidgetIconKey, WidgetItem } from "@/app/_components/dashboard/types";

type SortableWidgetGridProps = {
  initialItems: WidgetItem[];
  iconOptions: WidgetIconKey[];
};

type SortableCardProps = {
  item: WidgetItem;
  iconOptions: WidgetIconKey[];
  onIconChange: (widgetId: string, iconKey: WidgetIconKey) => void;
};

function SortableCard({
  item,
  iconOptions,
  onIconChange,
}: SortableCardProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const dragStateClass = isDragging ? "opacity-80" : "opacity-100";

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-emerald-900/20 bg-white p-4 ${dragStateClass}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-900 p-2 text-white">
            <DashboardIcon iconKey={item.iconKey} size={20} />
          </div>
          <h3 className="text-lg font-medium text-emerald-900">{item.title}</h3>
        </div>
        <button
          type="button"
          aria-label={`Drag ${item.title} card`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-emerald-900/20 bg-white text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          {...attributes}
          {...listeners}
        >
          <DotsSixVertical size={20} weight="bold" />
        </button>
      </div>

      <p className="text-3xl font-medium text-emerald-900">{item.value}</p>
      <p className="mt-1 text-base font-normal text-emerald-800">{item.helperText}</p>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-emerald-800">Choose icon</p>
        <div className="flex flex-wrap gap-2">
          {iconOptions.map((iconKey) => {
            const isSelected = iconKey === item.iconKey;
            const selectedClass = isSelected
              ? "border-emerald-900 bg-emerald-900 text-white"
              : "border-emerald-900/20 bg-white hover:bg-emerald-800 hover:text-white";
            return (
              <button
                key={iconKey}
                type="button"
                aria-label={`Use ${iconKey} icon for ${item.title}`}
                aria-pressed={isSelected}
                onClick={() => {
                  onIconChange(item.id, iconKey);
                }}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border text-emerald-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${selectedClass}`}
              >
                <DashboardIcon iconKey={iconKey} size={18} />
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export function SortableWidgetGrid({
  initialItems,
  iconOptions,
}: SortableWidgetGridProps): JSX.Element {
  const [items, setItems] = useState<WidgetItem[]>(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);
      return arrayMove(currentItems, oldIndex, newIndex);
    });
  };

  const handleIconChange = (widgetId: string, iconKey: WidgetIconKey): void => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== widgetId) {
          return item;
        }
        return { ...item, iconKey };
      }),
    );
  };

  return (
    <section
      aria-label="Reorderable dashboard widgets"
      className="rounded-2xl border border-emerald-900/20 bg-white p-5"
    >
      <h2 className="text-2xl font-medium text-emerald-900">Custom Dashboard Widgets</h2>
      <p className="mt-1 text-base font-normal text-emerald-800">
        Drag cards to change order. Choose icons to personalize each card.
      </p>

      <div className="mt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  iconOptions={iconOptions}
                  onIconChange={handleIconChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
