import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import DocumentContainer from "../components/DocumentContainer/DocumentContainer";
import { HashRouter } from "react-router-dom";
import { Attribute } from "../types";

const mockAttributes: Attribute[] = [
  {
    name: "well_name",
    key: "well_name",
    alias: "Well Name",
    value: "Test Well #1",
    raw_text: "Test Well #1",
    normalized_value: "Test Well #1",
    normalized_vertices: [[0.1, 0.1], [0.5, 0.1], [0.5, 0.2], [0.1, 0.2]],
    confidence: 0.95,
  },
  {
    name: "api_number",
    key: "api_number",
    alias: "API Number",
    value: "12345678",
    raw_text: "12345678",
    normalized_value: "12345678",
    normalized_vertices: [[0.1, 0.3], [0.5, 0.3], [0.5, 0.4], [0.1, 0.4]],
    confidence: 0.98,
  },
];

const mockFunction = () => {};

test("renders zoom lens icons and handles zoom controls and reset on field click", () => {
  render(
    <HashRouter>
      <DocumentContainer
        imageFiles={["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]}
        attributesList={mockAttributes}
        handleChangeValue={mockFunction}
        locked={false}
        recordSchema={{}}
        insertField={mockFunction}
        deleteField={mockFunction}
        forceEditMode={[-1, -1]}
        handleSuccessfulAttributeUpdate={mockFunction}
        showError={mockFunction}
        reviewStatus="unreviewed"
        updateFieldCoordinates={mockFunction}
        loading={false}
        recordStatus="digitized"
        image_whitespace={[]}
        record_group_id="rg1"
        setImageFiles={mockFunction}
        hasRecordImages={true}
      />
    </HashRouter>
  );

  const zoomInBtn = screen.getByTestId("zoom-in-button");
  expect(screen.getByTestId("zoom-out-button")).toHaveAttribute("disabled");

  act(() => {
    fireEvent.click(zoomInBtn);
  });

  expect(screen.getByTestId("zoom-out-button")).not.toHaveAttribute("disabled");
  expect(screen.getByTestId("zoom-reset-button")).not.toBeNull();

  const fieldElement = screen.getByText("well_name");
  act(() => {
    fireEvent.click(fieldElement);
  });

  expect(screen.getByTestId("zoom-reset-button")).toHaveAttribute("disabled");
  expect(screen.getByTestId("zoom-out-button")).toHaveAttribute("disabled");
});

test("keeps field highlighted, zooms into bounding box on zoom click, and opens edit mode on Enter", () => {
  const { container } = render(
    <HashRouter>
      <DocumentContainer
        imageFiles={["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]}
        attributesList={mockAttributes}
        handleChangeValue={mockFunction}
        locked={false}
        recordSchema={{}}
        insertField={mockFunction}
        deleteField={mockFunction}
        forceEditMode={[-1, -1]}
        handleSuccessfulAttributeUpdate={mockFunction}
        showError={mockFunction}
        reviewStatus="unreviewed"
        updateFieldCoordinates={mockFunction}
        loading={false}
        recordStatus="digitized"
        image_whitespace={[]}
        record_group_id="rg1"
        setImageFiles={mockFunction}
        hasRecordImages={true}
      />
    </HashRouter>
  );

  const fieldRow = screen.getByText("well_name").closest("tr")!;
  const zoomInBtn = screen.getByTestId("zoom-in-button");
  const imageBox = container.querySelector("#image-box") as HTMLDivElement;

  // Click on field to highlight it on the left and its bounding box on the right
  act(() => {
    fireEvent.click(fieldRow);
  });

  expect(screen.getByTestId("edit-field-button")).toBeInTheDocument();
  expect(container.querySelector(".ReactCrop__crop-selection")).not.toBeNull();

  // Click zoom in button afterward
  zoomInBtn.focus();
  act(() => {
    fireEvent.click(zoomInBtn);
  });

  // Field remains highlighted on the left and bounding box remains on the right
  expect(screen.getByTestId("edit-field-button")).toBeInTheDocument();
  expect(container.querySelector(".ReactCrop__crop-selection")).not.toBeNull();
  expect(screen.getByTestId("zoom-out-button")).not.toHaveAttribute("disabled");

  // Image box scrolls to zoom into the field's bounding box (center [30%, 15%] of scaled 1250x1250 = [375, 187.5])
  expect(imageBox.scrollLeft).toBeGreaterThan(0);
  expect(imageBox.scrollTop).toBeGreaterThan(0);

  // Zoom button does not retain focus; pressing Enter opens edit mode instead of zooming in
  expect(document.activeElement).not.toBe(zoomInBtn);
  const imageDiv = container.querySelector("#image-div") as HTMLDivElement;
  expect(imageDiv.style.transform).toBe("scale(1.25)");

  act(() => {
    fireEvent.keyDown(document, { key: "Enter", code: "Enter" });
  });

  expect(screen.getByTestId("edit-field-input")).toBeInTheDocument();
  expect(imageDiv.style.transform).toBe("scale(1.25)");
});

test("enters edit mode on double clicking attribute row", () => {
  render(
    <HashRouter>
      <DocumentContainer
        imageFiles={["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]}
        attributesList={mockAttributes}
        handleChangeValue={mockFunction}
        locked={false}
        recordSchema={{}}
        insertField={mockFunction}
        deleteField={mockFunction}
        forceEditMode={[-1, -1]}
        handleSuccessfulAttributeUpdate={mockFunction}
        showError={mockFunction}
        reviewStatus="unreviewed"
        updateFieldCoordinates={mockFunction}
        loading={false}
        recordStatus="digitized"
        image_whitespace={[]}
        record_group_id="rg1"
        setImageFiles={mockFunction}
        hasRecordImages={true}
      />
    </HashRouter>
  );

  const fieldRow = screen.getByText("well_name").closest("tr")!;
  expect(screen.queryByTestId("edit-field-input")).toBeNull();

  act(() => {
    fireEvent.doubleClick(fieldRow);
  });

  expect(screen.getByTestId("edit-field-input")).toBeInTheDocument();
  expect((screen.getByTestId("edit-field-input").querySelector("input") as HTMLInputElement).value).toBe("Test Well #1");

  const secondFieldRow = screen.getByText("api_number").closest("tr")!;
  act(() => {
    fireEvent.doubleClick(secondFieldRow);
  });

  const inputs = screen.getAllByTestId("edit-field-input");
  expect(inputs.length).toBe(1);
  expect((inputs[0].querySelector("input") as HTMLInputElement).value).toBe("12345678");
});

test("enters edit mode on clicking edit button on selected row without auto-closing", () => {
  render(
    <HashRouter>
      <DocumentContainer
        imageFiles={["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]}
        attributesList={mockAttributes}
        handleChangeValue={mockFunction}
        locked={false}
        recordSchema={{}}
        insertField={mockFunction}
        deleteField={mockFunction}
        forceEditMode={[-1, -1]}
        handleSuccessfulAttributeUpdate={mockFunction}
        showError={mockFunction}
        reviewStatus="unreviewed"
        updateFieldCoordinates={mockFunction}
        loading={false}
        recordStatus="digitized"
        image_whitespace={[]}
        record_group_id="rg1"
        setImageFiles={mockFunction}
        hasRecordImages={true}
      />
    </HashRouter>
  );

  const fieldRow = screen.getByText("well_name").closest("tr")!;
  // Single-click to select field
  act(() => {
    fireEvent.click(fieldRow);
  });

  const editButton = screen.getByTestId("edit-field-button");
  expect(editButton).toBeInTheDocument();

  // Click edit button on already selected row
  act(() => {
    fireEvent.click(editButton);
  });

  expect(screen.getByTestId("edit-field-input")).toBeInTheDocument();
});
