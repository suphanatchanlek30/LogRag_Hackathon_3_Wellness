interface BluetoothRequestDeviceFilter {
  namePrefix?: string;
}

interface BluetoothRequestDeviceOptions {
  acceptAllDevices?: boolean;
  filters?: BluetoothRequestDeviceFilter[];
  optionalServices?: string[];
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly value: DataView | null;
  readonly properties: {
    writeWithoutResponse?: boolean;
  };
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  writeValueWithResponse(value: BufferSource): Promise<void>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  readonly connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDevice extends EventTarget {
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
}

interface Bluetooth {
  requestDevice(options?: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
}

interface Navigator {
  readonly bluetooth?: Bluetooth;
}

