import { Directive, EventEmitter, HostBinding, HostListener, Output } from "@angular/core";
import { FileStructureItem } from "../_models/file-structure-item.model";

@Directive({
  selector: '[appDropZone]'
})
export class DropZoneDirective {

  @Output() fileDrop = new EventEmitter<any>();

  private dragEnterTarget: any;
  private counter = 0;
  private files: any[] = [];
  private folders: any[] = [];

  @HostBinding('class.file-over') isFileDraggedOver = false;

  @HostListener('dragover', ['$event']) onDragOver(e: DragEvent) {
    // todo: think if we need this handler
  }

  @HostListener('dragenter', ['$event']) onDragEnter(e: DragEvent) {
    this.dragEnterTarget = e.srcElement; // todo: check if e.srcElement is still working (not depecated)
    this.isFileDraggedOver = true;
  }


  @HostListener('dragleave', ['$event']) onDragLeave(e: DragEvent) {
    // todo: check if e.srcElement is still working (not depecated)
    if(e.srcElement === this.dragEnterTarget) { 
      this.isFileDraggedOver = false;
    }
  }

  @HostListener('drop', ['$event']) onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isFileDraggedOver = false;
    this.counter = 1;

    this.files = [];
    this.folders = this.getFiles(e.dataTransfer!);
    
    e.dataTransfer!.items.clear();

    setTimeout(()=>{
      this.fileDrop.emit({
        files: this.files,
        folders: this.folders
      });
    }, 1000); // todo: check if we still need a delay of 1000ms here
  }

  @HostListener('body:dragover', ['$event']) onBodyDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  private getFiles(dataTransfer: DataTransfer): FileStructureItem[] {
    const items: FileStructureItem[] = [];

    if (dataTransfer && dataTransfer.items && dataTransfer.items.length > 0) {
      for (const item of Array.from(dataTransfer.items)) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if(!entry) {
            continue;
          }
          items.push(this.traverseFileTree(entry, 0, this.counter, ''));
        }
      }
    }/*
    else if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
        console.log(Array.from(dataTransfer.files));
    }/**/

    return items;
  }

  traverseFileTree(item: any, parentFolderId: number, itemId: number, path: string): any {
    path = path || '';
    this.counter++;
    if (item.isFile) {
      let file: FileStructureItem = {
        name: item.name,
        itemId: itemId.toString(),
        size: null,
        //modified: lastModified,
        stream: null,
      };

      item.file((f: any) => {
        this.files.push({
          id: itemId,
          data: f,
          isFolder: false,
          parentFolderId: parentFolderId ? parentFolderId.toString() : null,
        });
      });

      return file;
    } else if (item.isDirectory) {
        const dirReader = item.createReader();
        const directory = { 
          name: item.name, 
          path, 
          isFolder: true,
          itemId: itemId.toString(), 
          parentFolderId: parentFolderId ? parentFolderId.toString() : null,
          children: <any>[] 
        };

        dirReader.readEntries((entries: any) => {
          for (const entry of Array.from(entries)) {
            const folderChild = this.traverseFileTree(entry, itemId, this.counter, path + item.name + "/");
            directory.children.push(folderChild);
          }
        });

        return directory;
      }
    }
}