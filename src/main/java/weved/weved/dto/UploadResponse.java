package weved.weved.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UploadResponse {
    private List<Item> items;
    private String message;

    public UploadResponse(List<Item> items) {
        this.items = items;
        this.message = "Успешно";
    }

    public UploadResponse(String message) {
        this.items = new ArrayList<>();
        this.message = message;
    }
}
